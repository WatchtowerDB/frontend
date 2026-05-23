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
      console.log("Failed to save stream position to localStorage", e)
    }
  },

  clear: (checkId: number) => {
    // This isnt used at all either.
    try {
      localStorage.removeItem(StreamCache.getKey(checkId))
    } catch {
      console.log("Failed to clear for whatever reason.")
    }
  },
  clearAll: () => {
    // This is not used at all rn.
    try {
      const prefix = "watchtower_last_event_"
      Object.keys(localStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => localStorage.removeItem(key))
    } catch (e) {
      console.log("Failed to clear all stream positions from localStorage", e)
    }
  },
}

export function useComplianceStreams() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()
  const activeCheckIds = useComplianceCheckStore(useShallow((s) => s.activeCheckIds))
  const storeReset = useComplianceCheckStore((s) => s.reset)

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
    // StreamCache.clearAll()
    // storeReset()
    console.log("IT IS USED")
    const currentIds = new Set(activeCheckIds)
    const runningIds = new Set(Object.keys(controllersRef.current).map(Number))
    console.log("current and running id", currentIds, runningIds)

    // Abort any streams whose checkId is no longer in the active list.
    for (const id of runningIds) {
      if (!currentIds.has(id)) {
        console.log("For whatever reason, this has been triggered")
        controllersRef.current[id].abort()
        delete controllersRef.current[id]
      }
    }

    // Open a stream for every newly-added checkId.
    for (const checkId of currentIds) {
      if (runningIds.has(checkId)) continue

      const controller = new AbortController()
      controllersRef.current[checkId] = controller
      console.log("signal aborted? maybe")
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
            console.log("Haha", e.data)
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
            //           if (type.endsWith("recommendation.stream") && assertionId) {
            // console.log("recommendation.stream event:", data.event, "assertionId:", assertionId) }

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
                StreamCache.clear(checkId)
                removeActiveCheck(checkId)
              }
            }

            if (type.endsWith("assertion.result") && assertionId) {
              const passed = data.status === "passed"
              console.log(
                "151 has changed aID ",
                assertionId,
                "and check id",
                checkId,
                "streamingDone to",
                String(passed),
              )
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
                console.log(
                  "162 has changed aID ",
                  assertionId,
                  "and check id",
                  checkId,
                  "streamingDone to true",
                )
                queryClient.invalidateQueries({
                  queryKey: ["assertions", "detail", assertionId],
                })
              }
              if (data.event === "error") {
                console.log("For some reason", data.event, "is an error?")
                upsertLiveAssertion(assertionId, checkId, { streamingDone: true })
                console.log(
                  "169 has changed aID ",
                  assertionId,
                  "and check id",
                  checkId,
                  "streamingDone to true",
                )
              }
            }

            if (type.endsWith("system.status") && data.status === "completed") {
              console.log("You took one hell of a turn to end up triggering this if condition.")
              setCheckPhase(checkId, "complete")
              queryClient.invalidateQueries({ queryKey: ["assertions"] })
              removeActiveCheck(checkId)
            }
          },

          async onopen(response) {
            if (response.ok) {
              if (StreamCache.get(checkId)) {
                setCheckPhase(checkId, "analyzing")
                const freshAssertions = useComplianceCheckStore.getState().liveAssertions
                Object.entries(freshAssertions)
                  .filter(([, a]) => a.checkId === checkId && a.status === "failed")
                  .forEach(([id]) => {
                    upsertLiveAssertion(Number(id), checkId, { streamingDone: false })
                  })
              }
              return
            }
            if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              if (response.status === 401) {
                // Handle token expiration: typically you'd trigger a logout
                // or a token refresh here. ACCELERATOR, SAVE ME 🗣️ - I  gotchu bro.
                logout()
                console.error("SSE Authentication failed.")
              }
              throw new Error(`Fatal client streaming error for check ${checkId}.`)
            }
          },

          onerror(err) {
            console.log("onerror fired", err, "aborted?", controller.signal.aborted)
            if (controller.signal.aborted) throw err
            // StreamCache.clear(checkId)
            setCheckPhase(checkId, "error")
            // Mark every assertion belonging to this check as done so the
            // UI doesn't spin forever.
            const freshAssertions = useComplianceCheckStore.getState().liveAssertions
            Object.entries(freshAssertions)
              .filter(([, a]) => a.checkId === checkId && !a.streamingDone)
              .forEach(([id]) => {
                upsertLiveAssertion(Number(id), checkId, { streamingDone: true })
                console.log(
                  "1202 has changed aID ",
                  Number(id),
                  "and check id",
                  checkId,
                  "streamingDone to true",
                )
              })
            throw err
          },
        },
      )
    }
  }, [activeCheckIds])

  // Full cleanup on unmount (e.g. user navigates away).
  // useEffect(() => {
  //   return () => {
  //     Object.values(controllersRef.current).forEach((c) => c.abort())
  //     console.log("potential abort")
  //   }
  // }, [])

  //   const abortStreamManual = (checkId: number): string | null => {
  //   // 1. Check if the stream is actually running
  //   const controller = controllersRef.current[checkId]

  //   if (controller) {
  //     console.log(`[SAIYAN STRIKE] Manually aborting stream for checkId: ${checkId}`)
  //     // 2. Terminate the connection immediately
  //     controller.abort()
  //     // 3. Clean up the tracking reference
  //     delete controllersRef.current[checkId]
  //   } else {
  //     console.log(`No active stream found to abort for checkId: ${checkId}`)
  //   }

  //   // 4. Retrieve the last event ID processed by onmessage
  //   const lastEventId = StreamCache.get(checkId)

  //   // 5. Update the Zustand store phase so the UI updates
  //   setCheckPhase(checkId, "error") // or custom state like "paused" if you implement one
  //   removeActiveCheck(checkId)

  //   return lastEventId
  // }

  // // EXPOSE IT TO THE WORLD!
  // return {
  //   abortStreamManual
  // }
}
