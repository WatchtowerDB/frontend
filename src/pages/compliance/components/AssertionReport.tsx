import { AlertCircle, CheckCircle2, InfoIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import SqlBlock from "@/components/SqlBlock"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

import { useAssertionDetails } from "@/hooks/useAssertions"
import { cn } from "@/lib/utils"
import { useComplianceCheckStore, type LiveAssertion } from "@/stores/useComplianceCheckStore"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssertionItem } from "@/types/compliance"

interface AssertionReportProps {
  assertionId: number | null
  title?: string
}

type ViewState = "empty" | "error" | "passed" | "streaming" | "failed" | "loading"

// This is a function that helps organize what shows in the report, to help clear up the confusion with the stream.
function deriveViewState(params: {
  assertionId: number | null
  assertion: AssertionItem | undefined
  livePhase: string
  isStreaming: boolean | null
  live: LiveAssertion | null
}): ViewState {
  const { assertionId, assertion, livePhase, isStreaming, live } = params

  if (!assertionId) return "empty" // Nothing selected.
  if (assertion?.result === true) return "passed" // a passed compliance, show the passed screen.
  if (livePhase === "error" && !assertion?.recommendation) return "error" // stream broke for whatever reason
  if (isStreaming && live?.recommendation) return "streaming" // currently generating tokens
  if (assertion?.result === false && (assertion?.recommendation || live?.recommendation))
    return "failed" // completed failure report, show the report
  return "loading" // is just loading. waiting for first token.
}

// This is for handling markdown in-report, to color the code.
const markdownComponents: Components = {
  pre({ children }) {
    return <>{children}</>
  },
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || "")
    if (match) {
      return <SqlBlock query={String(children).trim()} label={match[1].toUpperCase()} />
    }
    return <code className={className}>{children}</code>
  },
}

export default function AssertionReport({
  assertionId,
  title = "Assertion Details",
}: AssertionReportProps) {
  const { data: assertion } = useAssertionDetails(assertionId)
  const liveAssertions = useComplianceCheckStore((s) => s.liveAssertions)
  const livePhase = useComplianceCheckStore((s) => {
    if (!assertionId) return "idle"
    const checkId = s.liveAssertions[assertionId]?.checkId
    if (checkId === undefined) return "idle"
    return s.checkStreams[checkId]?.phase ?? "idle"
  })
  const live = assertionId ? liveAssertions[assertionId] : null
  const isStreaming = live && !live.streamingDone
  const recommendation = live?.recommendation ?? assertion?.recommendation ?? ""

  const viewState = deriveViewState({ assertionId, assertion, livePhase, isStreaming, live })

  const result =
    live?.status === "passed" ? true : live?.status === "failed" ? false : assertion?.result

  // Viewport, scroll & sidebar status
  const bottomRef = useRef<HTMLDivElement>(null)
  const userHasScrolledUp = useRef(false)
  const scrollViewportRef = useRef<Element | null>(null)

  const { open } = useSidebar()

  // Effect 1: Attach/detach the scroll listener once per stream session
  useEffect(() => {
    if (!bottomRef.current) return
    const viewport = bottomRef.current.closest("[data-radix-scroll-area-viewport]")
    if (!viewport) return

    scrollViewportRef.current = viewport

    const handleScroll = () => {
      const el = viewport as HTMLDivElement
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      // Any upward movement at all (> 2px tolerance) breaks the lock
      userHasScrolledUp.current = distanceFromBottom > 2
    }

    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [assertionId]) // Re-attach only when the assertion changes, not every token

  // Effect 2: Reset lock and auto-scroll on new stream
  useEffect(() => {
    if (!isStreaming) return
    // Only reset at stream start (when recommendation is empty/short)
    if (!recommendation) {
      userHasScrolledUp.current = false
    }

    if (userHasScrolledUp.current) return

    const viewport = scrollViewportRef.current as HTMLDivElement | null
    if (!viewport) return

    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
  }, [recommendation, isStreaming])

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex-none border-b px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <SidebarTrigger />
              </TooltipTrigger>
              <TooltipContent>{open ? "Hide assertions" : "Show assertions"}</TooltipContent>
            </Tooltip>
            {title}
            {assertion ? (
              <Badge variant={result ? "outline" : "destructive"} className="ml-2">
                {result ? "Pass" : "Fail"}
              </Badge>
            ) : null}
          </h2>
        </div>

        <div className="relative min-h-0 flex-1">
          <ScrollArea key={assertionId} className="h-full w-full">
            {(() => {
              switch (viewState) {
                case "empty":
                  return (
                    <div className="flex h-full flex-col items-center justify-center py-20 text-slate-400 italic">
                      <InfoIcon className="mb-2 h-8 w-8 opacity-20" />
                      <p>Select an assertion to view its audit intelligence.</p>
                    </div>
                  )

                case "error":
                  return (
                    <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-slate-500">
                      <Loader className="h-8 w-8 animate-spin text-indigo-500" />
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span>Stream disconnected. Please refresh the page.</span>
                      </div>
                    </div>
                  )

                case "passed":
                  return (
                    <div className="p-6">
                      {assertion?.sql_query && <SqlBlock query={assertion.sql_query} label="SQL" />}
                      <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center shadow-sm">
                        <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
                        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
                          Compliance Verified
                        </h3>
                        <p className="mt-2 max-w-md text-sm text-emerald-600/80 dark:text-emerald-400/70">
                          This target database constraint successfully passed all automated
                          compliance checks. No structural anomalies detected.
                        </p>
                      </div>
                    </div>
                  )

                case "streaming":
                case "failed":
                  return (
                    <div className="p-6">
                      {assertion?.sql_query && <SqlBlock query={assertion.sql_query} label="SQL" />}
                      <article
                        className={cn(
                          "prose prose-slate dark:prose-invert max-w-none",
                          viewState === "streaming" && [
                            "[&_p:last-child]:after:content-['▍']",
                            "[&_p:last-child]:after:inline-block",
                            "[&_p:last-child]:after:ml-1",
                            "[&_p:last-child]:after:text-indigo-500",
                            "[&_p:last-child]:after:animate-pulse",
                          ],
                        )}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {recommendation}
                        </ReactMarkdown>
                      </article>
                      <div ref={bottomRef} className="h-2" />
                    </div>
                  )

                case "loading":
                  return (
                    <div className="flex h-full flex-col items-center justify-center gap-2 py-20 text-slate-400">
                      <Loader className="h-6 w-6 animate-spin text-indigo-500" />
                      <p className="text-sm italic">Generating audit intelligence...</p>
                    </div>
                  )
              }
            })()}
          </ScrollArea>
        </div>
        <div className="border-t bg-white px-6 transition-colors duration-200 dark:bg-slate-950">
          <Alert className="rounded-none border-none bg-transparent p-0 py-3">
            <AlertDescription className="text-muted-foreground text-center text-[10px] leading-relaxed tracking-widest uppercase">
              All responses are AI-generated and may not always be accurate or complete. They should
              be independently reviewed and verified by a domain expert. WatchtowerDB is NOT
              responsible for any actions taken based on these responses.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </TooltipProvider>
  )
}
