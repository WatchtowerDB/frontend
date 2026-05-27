import { useAuthStore } from "@/stores/useAuthStore"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { useShallow } from "zustand/shallow"

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
      console.log("[SSE LocalStorage]: Failed to save stream position to localStorage", e)
    }
  },

  clear: (checkId: number) => {
    // RESERVED FOR FUTURE IMPLEMENTATION: It is not currently used.
    try {
      localStorage.removeItem(StreamCache.getKey(checkId))
    } catch {
      console.log("[SSE localStorage]: Failed to clear checkId: ", checkId)
    }
  },
  clearAll: () => {
    try {
      const prefix = "watchtower_last_event_"
      Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => localStorage.removeItem(key))
    } catch (e) {
      console.log("[SSE localStorage]: Failed to clear all stream positions from localStorage", e)
    }
  },
}

export function useComplianceStreams() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()
  const activeCheckIds = useComplianceCheckStore(useShallow((s) => s.activeCheckIds))

  // Stable action references — Zustand actions never change identity.
  const setCheckPhase = useComplianceCheckStore((s) => s.setCheckPhase)
  const upsertLiveAssertion = useComplianceCheckStore((s) => s.upsertLiveAssertion)
  const appendToken = useComplianceCheckStore((s) => s.appendToken)
  const removeActiveCheck = useComplianceCheckStore((s) => s.removeActiveCheck)

  // Tracks live AbortControllers by checkId, outside React state so we don't
  // trigger re-renders when we open/close individual streams.
  const controllersRef = useRef<Record<number, AbortController>>({})

  // Cache specifically to support last-event-ID on refresh.

  useEffect(() => {
    const currentIds = new Set(activeCheckIds)
    const runningIds = new Set(Object.keys(controllersRef.current).map(Number))

    // Abort any streams whose checkId is no longer in the active list.
    for (const id of runningIds) {
      if (!currentIds.has(id)) {
        controllersRef.current[id].abort()
        delete controllersRef.current[id]
      }
    }

    // Open a stream for every newly-added checkId.
    for (const checkId of currentIds) {
      if (runningIds.has(checkId)) continue

      const controller = new AbortController()
      controllersRef.current[checkId] = controller
      fetchEventSource(
        `${import.meta.env.VITE_BACKEND_URL}/api/compliance/checks/${checkId}/stream/`,
        {
          get headers() {
            const lastEventId = StreamCache.get(checkId)
            // This getter ensures that if the library retries, it pulls the
            // latest token from the store instead of using a stale one.
            const headers: Record<string, string> = {
              Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
            }
            if (lastEventId) {
              headers["Last-Event-Id"] = lastEventId
            }
            console.log(`[SSE HEADERS] Request headers constructed for checkId: ${checkId}`, {
              lastEventId,
              Authorization: "Bearer [REDACTED]",
            })
            return headers
          },
          signal: controller.signal,
          openWhenHidden: true, // Found this! Prevents the browser from killing the stream when tab is inactive

          onmessage(e) {
            if (e.id) {
              StreamCache.set(checkId, e.id)
            }

            let event
            try {
              event = JSON.parse(e.data)
            } catch {
              return
            }

            // Fallback: If e.event is generic "message" or empty, use the type from the JSON body
            const type: string = e.event && e.event !== "message" ? e.event : event.type || ""

            const data = event.data
            const subject: string | undefined = event.subject
            const assertionId = subject ? Number(subject.split("/")[1]) : null

            // Handle Reconnection/Resuming state from backend
            if (type.endsWith("system.resuming")) {
              setCheckPhase(checkId, "reconnecting")
              const { last_known_step } = data
              if (last_known_step === "assertion_generation") setCheckPhase(checkId, "generating")
              if (last_known_step === "execution") setCheckPhase(checkId, "executing")
              if (last_known_step === "analysis") {
                setCheckPhase(checkId, "analyzing")
                // Re-invalidate to ensure we have the latest results after gap
                queryClient.invalidateQueries({ queryKey: ["assertions"] })
              }
            }

            if (type.endsWith("phase.update")) {
              const { step, status } = data
              if (step === "assertion_generation" && status === "started")
                setCheckPhase(checkId, "generating")
              if (step === "assertion_generation" && status === "completed") {
                setCheckPhase(checkId, "executing")
                queryClient.invalidateQueries({ queryKey: ["assertions"] })
                queryClient.invalidateQueries({ queryKey: ["checks", "latest"] })
              }
              if (step === "execution" && status === "started") setCheckPhase(checkId, "executing")
              if (step === "analysis" && status === "started") setCheckPhase(checkId, "analyzing")
              if (step === "analysis" && status === "completed") {
                setCheckPhase(checkId, "complete")
                queryClient.invalidateQueries({ queryKey: ["assertions"] })
                // Clean up.
                removeActiveCheck(checkId)
                StreamCache.clear(checkId)
              }
            }

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
                queryClient.invalidateQueries({
                  queryKey: ["assertions", "detail", assertionId],
                })
              }
              if (data.event === "error") {
                upsertLiveAssertion(assertionId, checkId, { streamingDone: true })
              }
            }
          },

          async onopen(response) {
            if (response.ok) {
              if (!StreamCache.get(checkId)) {
                setCheckPhase(checkId, "initiating")
              }

              console.log(`[SSE] Connection established for check ${checkId}`)
              return
            }
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              if (response.status === 401) {
                // Handle token expiration: typically you'd trigger a logout
                // or a token refresh here. ACCELERATOR, SAVE ME 🗣️ - I  gotchu bro.
                logout()
                console.error("[SSE]: Authentication failed. Logging out.")
              }
              throw new Error(`[SSE]: Fatal client streaming error for check ${checkId}.`)
            }
          },

          onerror(err) {
            console.log(
              "[SSE] OnError occured: ",
              err,
              ", abort status: ",
              controller.signal.aborted,
            )
            if (controller.signal.aborted) throw err

            // Swallow the transient "Error in input stream" that fires on page load
            // before the connection is fully established. The library retries automatically.
            const isInputStreamError =
              err instanceof TypeError && err.message === "Error in input stream"
            if (isInputStreamError) {
              console.log("[SSE] Transient input stream error — letting library retry silently.")
              return // Don't throw; library will retry
            }

            // StreamCache.clear(checkId)
            // setCheckPhase(checkId, "error")
            console.log("Clearly, the onError has set the checkPhase for", checkId, "to error")
            // In case, I'm leaving these here, for the implementation is likely to change.
            // Right now, error just leaves things as they are, and reconnect handles either reconnecting,
            // or cleaning up if there's nothing left streaming.
            //
            // const freshAssertions = useComplianceCheckStore.getState().liveAssertions
            // Object.entries(freshAssertions)
            //   .filter(([, a]) => a.checkId === checkId && !a.streamingDone)
            //   .forEach(([id]) => {
            //     upsertLiveAssertion(Number(id), checkId, { streamingDone: true })
            //     console.log(
            //       "1202 has changed aID ",
            //       Number(id),
            //       "and check id",
            //       checkId,
            //       "streamingDone to true",
            //     )
            //   }
            // )
            throw err
          },
        },
      )
    }
  }, [activeCheckIds])
}
