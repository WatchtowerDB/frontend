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

    fetchEventSource(
      `${import.meta.env.VITE_BACKEND_URL}/api/compliance/checks/${checkId}/stream/`,
      {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        },
        signal: controller.signal,

        onmessage(e) {
          const event = JSON.parse(e.data)
          const type: string = event.type
          const data = event.data
          const subject: string | undefined = event.subject
          const assertionId = subject ? Number(subject.split("/")[1]) : null

          if (type.endsWith("phase.update")) {
            const { step, status } = data
            if (step === "assertion_generation" && status === "started") setPhase("generating")
            if (step === "assertion_generation" && status === "completed") {
              setPhase("executing")
              queryClient.invalidateQueries({ queryKey: ["assertions", "list"] })
            }
            if (step === "execution" && status === "started") setPhase("executing")
            if (step === "analysis" && status === "started") setPhase("analyzing")
          }

          if (type.endsWith("assertion.result") && assertionId) {
            upsertLiveAssertion(assertionId, {
              status: data.status === "passed" ? "passed" : "failed",
            })
          }

          if (type.endsWith("recommendation.stream") && assertionId) {
            if (data.event === "token") appendToken(assertionId, data.content)
            if (data.event === "complete") upsertLiveAssertion(assertionId, { streamingDone: true })
            if (data.event === "error") upsertLiveAssertion(assertionId, { streamingDone: true })
          }

          if (type.endsWith("system.status") && data.status === "completed") {
            setPhase("complete")
            queryClient.invalidateQueries({ queryKey: ["assertions", "list"] })
            controller.abort()
          }
        },
        async onopen(response) {
          console.log("SSE open status:", response.status)
          console.log("SSE content-type:", response.headers.get("content-type"))
          if (!response.ok) {
            const body = await response.text()
            console.log("SSE error body:", body)
          }
        },
        onerror(err) {
          setPhase("error")
          throw err
        },
      },
    )

    return () => controller.abort()
  }, [checkId])
}
