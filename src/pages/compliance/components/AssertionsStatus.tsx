import { useAssertions } from "@/hooks/useAssertions"
import { useLatestCheck } from "@/hooks/useChecks"
import { cn, timeAgo } from "@/lib/utils"
import { selectOverallPhase, useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { AlertCircleIcon, CheckIcon } from "lucide-react"
import { startTransition, useEffect, useState } from "react"

export type ViewState = "idle" | "fetching" | "streaming" | "complete" | "error"

interface AssertionsStatusProps {
  className?: string
  textClassName?: string
  onStatusChange?: (status: ViewState) => void
}

export function AssertionsStatus({
  className,
  textClassName,
  onStatusChange,
}: AssertionsStatusProps) {
  const { isError, error, isFetching } = useAssertions()
  const checkStreams = useComplianceCheckStore((s) => s.checkStreams)
  const clearCompletedChecks = useComplianceCheckStore((s) => s.clearCompletedChecks)
  const { data: latestCheck } = useLatestCheck()

  // Fold all check phases into one signal.
  const phase = selectOverallPhase(checkStreams)

  const viewState: ViewState = (() => {
    if (phase === "error" || isError) return "error"
    if (phase !== "idle" && phase !== "complete") return "streaming"
    if (phase === "complete") return "complete"
    if (isFetching) return "fetching"
    return "idle"
  })()

  const [displayState, setDisplayState] = useState<ViewState>("idle")
  const updateState = (s: ViewState) => {
    startTransition(() => setDisplayState(s))
    onStatusChange?.(s)
  }

  useEffect(() => {
    if (viewState === "complete") {
      startTransition(() => updateState("complete"))
      const t = setTimeout(() => {
        startTransition(() => updateState("idle"))
        clearCompletedChecks()
      }, 2000)
      return () => clearTimeout(t)
    }
    startTransition(() => updateState(viewState))
    onStatusChange?.(viewState)
  }, [viewState])

  // How many checks are actively streaming (for the label)?
  const activeCount = Object.values(checkStreams).filter(
    (c) => c.phase !== "idle" && c.phase !== "complete" && c.phase !== "error",
  ).length

  return (
    <div className={cn("flex items-center gap-2 px-4 py-1", className)}>
      {displayState === "idle" && (
        <>
          {latestCheck?.date ? (
            <>
              <span className="bg-muted-foreground/40 size-1.5 shrink-0 rounded-full" />
              <span className={cn("text-muted-foreground text-[10px]", textClassName)}>
                Last ran: {timeAgo(new Date(latestCheck.date))}
              </span>
            </>
          ) : (
            <>
              <span className="size-1.5 shrink-0 rounded-full bg-amber-500/50" />
              <span className={cn("text-muted-foreground/70 text-[10px]", textClassName)}>
                No compliance checks recorded
              </span>
            </>
          )}
        </>
      )}

      {displayState === "fetching" && (
        <>
          <span className="bg-primary size-1.5 shrink-0 animate-pulse rounded-full" />
          <span
            className={cn("text-primary animate-pulse text-[10px] dark:text-white", textClassName)}
          >
            Fetching…
          </span>
        </>
      )}

      {displayState === "streaming" && (
        <>
          <span
            className="bg-primary size-1.5 shrink-0 animate-pulse rounded-full"
            style={{ animationDuration: "0.8s" }}
          />
          <span
            className={cn(
              "text-primary animate-pulse text-[10px] capitalize dark:text-white",
              textClassName,
            )}
            style={{ animationDuration: "0.8s" }}
          >
            {activeCount > 1 ? `${activeCount} checks queued — ` : ""} {phase}…
          </span>
        </>
      )}

      {displayState === "complete" && (
        <>
          <CheckIcon className="size-3 shrink-0 text-emerald-500" />
          <span className={cn("text-[10px] text-emerald-500", textClassName)}>Done</span>
        </>
      )}

      {displayState === "error" && (
        <>
          <AlertCircleIcon className="text-destructive size-3 shrink-0" />
          <span className={cn("text-destructive text-[10px]", textClassName)}>
            {isError
              ? `Error: ${error instanceof Error ? error.message : String(error)}`
              : phase === "error"
                ? "Streaming connection lost"
                : "Something went wrong"}
          </span>
        </>
      )}
    </div>
  )
}
