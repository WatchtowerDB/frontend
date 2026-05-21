import { useAssertions } from "@/hooks/useAssertions"
import { useLatestCheck } from "@/hooks/useChecks"
import { cn } from "@/lib/utils"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { AlertCircleIcon, CheckIcon } from "lucide-react"
import { startTransition, useEffect, useState } from "react"

export type ViewState = "idle" | "fetching" | "streaming" | "complete" | "error"

interface AssertionsStatusProps {
  className?: string
}

function timeAgo(date: Date): string {
  // we can make this its own util if at all ever needed.
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

export function AssertionsStatus({ className }: AssertionsStatusProps) {
  const { isLoading, isError, error, isFetching } = useAssertions()
  const phase = useComplianceCheckStore((s) => s.phase)
  const resetPhase = useComplianceCheckStore((s) => s.resetPhase)
  const { data: latestCheck } = useLatestCheck()
  const viewState: ViewState = (() => {
    if (phase === "error" || isError) return "error"
    if (phase !== "idle" && phase !== "complete") return "streaming"
    if (phase === "complete") return "complete"
    if (isFetching) return "fetching"
    return "idle"
  })()
  const [displayState, setDisplayState] = useState<ViewState>("idle")

  // TODO: make it so thei ndicator doesnt tie in with the refresh

  useEffect(() => {
    if (viewState === "complete") {
      startTransition(() => setDisplayState("complete"))
      const t = setTimeout(() => {
        startTransition(() => setDisplayState("idle"))
        resetPhase()
      }, 2000)
      return () => clearTimeout(t)
    }

    startTransition(() => setDisplayState(viewState))
  }, [viewState])

  return (
    <div className={cn("flex items-center gap-2 px-4 py-1", className)}>
      {displayState === "idle" && (
        <>
          <span className="bg-muted-foreground/40 size-1.5 shrink-0 rounded-full" />
          <span className="text-muted-foreground text-[10px]">
            {latestCheck?.date ? `Last ran: ${timeAgo(new Date(latestCheck?.date))}` : ""}
          </span>
        </>
      )}

      {displayState === "fetching" && (
        <>
          <span className="bg-primary size-1.5 shrink-0 animate-pulse rounded-full" />
          <span className="text-primary animate-pulse text-[10px]">Fetching…</span>
        </>
      )}

      {displayState === "streaming" && (
        <>
          <span
            className="bg-primary size-1.5 shrink-0 animate-pulse rounded-full"
            style={{ animationDuration: "0.8s" }}
          />
          <span
            className="text-primary animate-pulse text-[10px] capitalize"
            style={{ animationDuration: "0.8s" }}
          >
            {phase ?? "Streaming"}…
          </span>
        </>
      )}

      {displayState === "complete" && (
        <>
          <CheckIcon className="size-3 shrink-0 text-emerald-500" />
          <span className="text-[10px] text-emerald-500">Done</span>
        </>
      )}

      {displayState === "error" && (
        <>
          <AlertCircleIcon className="text-destructive size-3 shrink-0" />
          <span className="text-destructive text-[10px]">
            Error: {String(error) || "Something went wrong"}
          </span>
        </>
      )}
    </div>
  )
}
