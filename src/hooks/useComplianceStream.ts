import { fetchEventSource } from "@microsoft/fetch-event-source"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useShallow } from "zustand/shallow"

import { useAuthStore } from "@/stores/useAuthStore"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"

// ============================================================================
// STREAM POSITIONAL CACHE MANAGEMENT (LOCALSTORAGE)
// ============================================================================
const StreamCache = {
  getKey: (checkId: number) => `watchtower_last_event_${checkId}`,

  get: (checkId: number): string | null => {
    try {
      return localStorage.getItem(StreamCache.getKey(checkId))
    } catch {
      return null
    }
  },

  set: (checkId: number, id: string) => {
    try {
      if (id) localStorage.setItem(StreamCache.getKey(checkId), id)
    } catch (e) {
      console.error("[SSE Cache]: Failed to save stream location", e)
    }
  },

  clear: (checkId: number) => {
    try {
      localStorage.removeItem(StreamCache.getKey(checkId))
    } catch {
      console.error("[SSE Cache]: Failed to clear checkId:", checkId)
    }
  },

  clearAll: () => {
    try {
      const prefix = "watchtower_last_event_"
      Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => localStorage.removeItem(key))
    } catch (e) {
      console.error("[SSE Cache]: Failed to sweep localStorage positions", e)
    }
  },
}

// ============================================================================
// MAIN PIPELINE: MULTI-STREAM COMPLIANCE EVENT BUS
// ============================================================================
export function useComplianceStreams() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  // Slice out active triggers reactively
  const activeCheckIds = useComplianceCheckStore(useShallow((s) => s.activeCheckIds))

  // Unchanging stable store references
  const setCheckPhase = useComplianceCheckStore((s) => s.setCheckPhase)
  const upsertLiveAssertion = useComplianceCheckStore((s) => s.upsertLiveAssertion)
  const appendToken = useComplianceCheckStore((s) => s.appendToken)
  const removeActiveCheck = useComplianceCheckStore((s) => s.removeActiveCheck)

  // Track operational controllers across frames without forcing layout triggers
  const controllersRef = useRef<Record<number, AbortController>>({})

  useEffect(() => {
    const currentIds = new Set(activeCheckIds)
    const runningIds = new Set(Object.keys(controllersRef.current).map(Number))

    // 1. STRIKE DOWN REMOVED CHANNELS
    for (const id of runningIds) {
      if (!currentIds.has(id)) {
        controllersRef.current[id].abort()
        delete controllersRef.current[id]
        console.log(`[SSE] Explicitly terminated channel thread: ${id}`)
      }
    }

    // 2. SPAWN NEW GATEWAYS
    for (const checkId of currentIds) {
      if (runningIds.has(checkId)) continue

      const controller = new AbortController()
      controllersRef.current[checkId] = controller

      fetchEventSource(
        `${import.meta.env.VITE_BACKEND_URL}/api/compliance/checks/${checkId}/stream/`,
        {
          signal: controller.signal,
          openWhenHidden: true, // Safeguard network line from browser sleeping behaviors

          get headers() {
            const lastEventId = StreamCache.get(checkId)
            const headers: Record<string, string> = {
              Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
            }
            if (lastEventId) headers["Last-Event-Id"] = lastEventId

            return headers
          },

          async onopen(response) {
            if (response.ok) {
              if (!StreamCache.get(checkId)) setCheckPhase(checkId, "initiating")
              console.log(`[SSE] Active connection established for check: ${checkId}`)
              return
            }

            // Route client authentication dropouts straight to termination
            if (response.status === 401) {
              logout()
              console.error("[SSE] Authentication credentials invalid. Logging out user context.")
            }
            throw new Error(
              `[SSE] Connection rejected by backend gateway. Status: ${response.status}`,
            )
          },

          onmessage(e) {
            if (e.id) StreamCache.set(checkId, e.id)

            let event
            try {
              event = JSON.parse(e.data)
            } catch {
              return
            }

            const type: string = e.event && e.event !== "message" ? e.event : event.type || ""
            const { data, subject } = event
            const assertionId = subject ? Number(subject.split("/")[1]) : null

            // --- PHASE A: RECOVERY HANDLING ---
            if (type.endsWith("system.resuming")) {
              setCheckPhase(checkId, "reconnecting")
              const { last_known_step } = data
              if (last_known_step === "assertion_generation") setCheckPhase(checkId, "generating")
              if (last_known_step === "execution") setCheckPhase(checkId, "executing")
              if (last_known_step === "analysis") {
                setCheckPhase(checkId, "analyzing")
                queryClient.invalidateQueries({ queryKey: ["assertions"] })
              }
            }

            // --- PHASE B: STATE MACHINE LIFECYCLE UPDATES ---
            if (type.endsWith("phase.update")) {
              const { step, status } = data

              if (step === "assertion_generation" && status === "started")
                setCheckPhase(checkId, "generating")
              if (step === "assertion_generation" && status === "completed") {
                setCheckPhase(checkId, "executing")
                queryClient.invalidateQueries({ queryKey: ["assertions"] })
              }
              if (step === "execution" && status === "started") setCheckPhase(checkId, "executing")
              if (step === "analysis" && status === "started") setCheckPhase(checkId, "analyzing")
              if (step === "analysis" && status === "completed") {
                setCheckPhase(checkId, "complete")
                queryClient.invalidateQueries({ queryKey: ["assertions"] })
                removeActiveCheck(checkId)
                StreamCache.clearAll()
              }
            }

            // --- PHASE C: LIVE TELEMETRY STREAMING DATA ---
            if (type.endsWith("assertion.result") && assertionId) {
              const passed = data.status === "passed"
              upsertLiveAssertion(assertionId, checkId, {
                status: passed ? "passed" : "failed",
                streamingDone: passed,
              })
            }

            if (type.endsWith("recommendation.stream") && assertionId) {
              if (data.event === "token") {
                upsertLiveAssertion(assertionId, checkId, { streamingDone: false })
                appendToken(assertionId, data.content)
              }
              if (data.event === "complete") {
                upsertLiveAssertion(assertionId, checkId, { streamingDone: true })
                queryClient.invalidateQueries({ queryKey: ["assertions", "detail", assertionId] })
              }
              if (data.event === "error") {
                upsertLiveAssertion(assertionId, checkId, { streamingDone: true })
              }
            }
          },

          onerror(err) {
            console.error(`[SSE Error] Fault occurred on stream channel #${checkId}:`, err)
            if (controller.signal.aborted) throw err

            setCheckPhase(checkId, "error")
            throw err
          },
        },
      )
    }

    // ⚡ 3. THE IMMORTAL CLEANUP FIX: Kill everything if hook unmounts!
    return () => {
      for (const id of Object.keys(controllersRef.current).map(Number)) {
        controllersRef.current[id].abort()
        delete controllersRef.current[id]
      }
    }
  }, [activeCheckIds])
}
