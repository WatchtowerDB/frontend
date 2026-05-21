import { useAuthStore } from "@/stores/useAuthStore"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

export function useComplianceStream(checkId: number | null) {
  const queryClient = useQueryClient()
  const { setPhase, upsertLiveAssertion, appendToken } = useComplianceCheckStore()

  useEffect(() => {
    if (!checkId) return

    const controller = new AbortController()

    const currentActiveAssertionId: number | null = null

    fetchEventSource(
      `${import.meta.env.VITE_BACKEND_URL}/api/compliance/checks/${checkId}/stream/`,
      {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        },
        signal: controller.signal,

        onmessage(e) {
          const event = JSON.parse(e.data)
          const type: string = e.event || event.type
          const data = event.data
          const subject: string | undefined = event.subject
          const assertionId = subject ? Number(subject.split("/")[1]) : null

          if (type.endsWith("phase.update")) {
            const { step, status } = data
            console.log("data is", data, "type is", type)
            if (step === "assertion_generation" && status === "started") setPhase("generating")
            if (step === "assertion_generation" && status === "completed") {
              setPhase("executing")
              queryClient.invalidateQueries({ queryKey: ["assertions"] })
            }
            if (step === "execution" && status === "started") setPhase("executing")
            if (step === "analysis" && status === "started") setPhase("analyzing")

            if (step === "analysis" && status === "completed") {
              // the defacto realizer of "done streaming"
              setPhase("complete")
              queryClient.invalidateQueries({ queryKey: ["assertions"] })
              controller.abort()
            }
          }
          if (type.endsWith("assertion.result") && assertionId) {
            const passed = data.status === "passed"
            upsertLiveAssertion(assertionId, {
              status: passed ? "passed" : "failed",
              streamingDone: passed ? true : false, // passed = done immediately, failed = wait for stream
              // queryClient.invalidateQueries({ queryKey: ["assertions", "detail", assertionId] })
              // put this back in case something messes up in terms of how pass and fail and subsequent report showing is handled.
            })
          }

          if (type.endsWith("recommendation.stream") && assertionId) {
            if (data.event === "token") appendToken(assertionId, data.content)
            if (data.event === "complete") {
              upsertLiveAssertion(assertionId, { streamingDone: true })
              queryClient.invalidateQueries({ queryKey: ["assertions", "detail", assertionId] })
            }
            if (data.event === "error") upsertLiveAssertion(assertionId, { streamingDone: true })
          }

          if (type.endsWith("system.status") && data.status === "completed") {
            // Practically useless, but a safety net.
            setPhase("complete")
            queryClient.invalidateQueries({ queryKey: ["assertions"] })
            controller.abort()
          }
        },
        async onopen(response) {
          if (response.ok) {
            return // Green light.
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // If it's a client error, throw an error to halt the automatic retry loop completely
            throw new Error("Fatal client streaming error.")
          }
        },
        onerror(err) {
          // This approach is so an error would tell the streaming that it's done.
          setPhase("error")
          if (currentActiveAssertionId) {
            upsertLiveAssertion(currentActiveAssertionId, { streamingDone: true })
          } else {
            const freshLiveAssertions = useComplianceCheckStore.getState().liveAssertions
            Object.keys(freshLiveAssertions).forEach((id) => {
              upsertLiveAssertion(Number(id), { streamingDone: true })
            })
          }
          throw err
        },
        // TODO: Replace this when Robin implements better support for last-event-id!
      },
    )

    return () => controller.abort()
  }, [checkId])
}
