import { useAuthStore } from "@/stores/useAuthStore"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

export function useComplianceStreams() {
  const queryClient = useQueryClient()
  const activeCheckIds = useComplianceCheckStore((s) => s.activeCheckIds)

  // Stable action references — Zustand actions never change identity.
  const setCheckPhase = useComplianceCheckStore((s) => s.setCheckPhase)
  const upsertLiveAssertion = useComplianceCheckStore((s) => s.upsertLiveAssertion)
  const appendToken = useComplianceCheckStore((s) => s.appendToken)
  const removeActiveCheck = useComplianceCheckStore((s) => s.removeActiveCheck)

  // Tracks live AbortControllers by checkId, outside React state so we don't
  // trigger re-renders when we open/close individual streams.
  const controllersRef = useRef<Record<number, AbortController>>({})

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
            // This getter ensures that if the library retries, it pulls the
            // latest token from the store instead of using a stale one.
            return {
              Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
            }
          },
          signal: controller.signal,
          openWhenHidden: true, // Found this! Prevents the browser from killing the stream when tab is inactive

          onmessage(e) {
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
                // Pull this check out of the active list so the effect
                // re-runs and naturally cleans up the controller via the logic above.
                removeActiveCheck(checkId)
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
              if (data.event === "token") appendToken(assertionId, data.content)
              if (data.event === "complete") {
                upsertLiveAssertion(assertionId, checkId, { streamingDone: true })
                queryClient.invalidateQueries({
                  queryKey: ["assertions", "detail", assertionId],
                })
              }
              if (data.event === "error")
                upsertLiveAssertion(assertionId, checkId, { streamingDone: true })
            }

            if (type.endsWith("system.status") && data.status === "completed") {
              setCheckPhase(checkId, "complete")
              queryClient.invalidateQueries({ queryKey: ["assertions"] })
              removeActiveCheck(checkId)
            }
          },

          async onopen(response) {
            if (response.ok) return
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              if (response.status === 401) {
                // Handle token expiration: typically you'd trigger a logout
                // or a token refresh here. ACCELERATOR, SAVE ME 🗣️
                console.error("SSE Authentication failed.")
              }
              throw new Error(`Fatal client streaming error for check ${checkId}.`)
            }
          },

          onerror(err) {
            setCheckPhase(checkId, "error")
            // Mark every assertion belonging to this check as done so the
            // UI doesn't spin forever.
            const freshAssertions = useComplianceCheckStore.getState().liveAssertions
            Object.entries(freshAssertions)
              .filter(([, a]) => a.checkId === checkId && !a.streamingDone)
              .forEach(([id]) => {
                upsertLiveAssertion(Number(id), checkId, { streamingDone: true })
              })
            throw err
          },
        },
      )
    }
  }, [activeCheckIds])

  // Full cleanup on unmount (e.g. user navigates away).
  useEffect(() => {
    return () => {
      Object.values(controllersRef.current).forEach((c) => c.abort())
    }
  }, [])
}
