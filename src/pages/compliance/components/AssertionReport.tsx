import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAssertions } from "@/hooks/useAssertions"
import { cn } from "@/lib/utils"
import { useComplianceCheckStore } from "@/stores/useComplianceCheckStore"
import { InfoIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface AssertionReportProps {
  assertionId: number | null
  title?: string
}

export default function AssertionReport({
  assertionId,
  title = "Assertion Details",
}: AssertionReportProps) {
  const { data } = useAssertions()
  const assertion = data?.results.find((a) => a.id === assertionId)
  const liveAssertions = useComplianceCheckStore((s) => s.liveAssertions)
  const live = assertionId ? liveAssertions[assertionId] : null

  const recommendation = live?.recommendation || assertion?.recommendation || ""
  const isStreaming = live && !live.streamingDone

  const result =
    live?.status === "passed" ? true : live?.status === "failed" ? false : assertion?.result

  const bottomRef = useRef<HTMLDivElement>(null)
  const userHasScrolledUp = useRef(false)

  // Auto-scrolling side effect targeting Radix's viewport architecture
  useEffect(() => {
    // 1. Reset the scroll lock whenever a brand new stream fires up
    if (isStreaming) {
      userHasScrolledUp.current = false
    }

    if (!bottomRef.current) return
    const scrollViewport = bottomRef.current.closest("[data-radix-scroll-area-viewport]")
    if (!scrollViewport) return

    // 2. Define the user interaction tracker
    const handleScroll = () => {
      const target = scrollViewport as HTMLDivElement
      const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight
      userHasScrolledUp.current = distanceFromBottom > 20
    }

    // 3. Bind the browser listener securely
    scrollViewport.addEventListener("scroll", handleScroll)

    // 4. Force the viewport down if the user hasn't broken the lock
    if (isStreaming && !userHasScrolledUp.current) {
      scrollViewport.scrollTo({
        top: scrollViewport.scrollHeight,
        behavior: "auto",
      })
    }

    // 5. Clean up the event listener before the next token evaluation or unmount
    return () => {
      scrollViewport.removeEventListener("scroll", handleScroll)
    }
  }, [assertionId, recommendation, isStreaming])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <SidebarTrigger />
          {title}
          {assertion ? (
            <Badge variant={result ? "outline" : "destructive"} className="ml-2">
              {assertion.result ? "Pass" : "Fail"}
            </Badge>
          ) : null}
        </h2>
      </div>

      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full w-full">
          {assertion ? (
            <div className="p-6">
              {/* The SQL Query */}
              <div className="relative mb-6">
                <span className="absolute inset-s-3 top-2 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                  SQL
                </span>
                <pre className="overflow-x-auto rounded-md border-2 bg-slate-950 p-4 pt-7 text-sm break-all whitespace-pre-wrap text-slate-50 shadow-lg">
                  <code>{assertion.sql_query}</code>
                </pre>
              </div>
              {/* The Assertion Report */}
              <article
                className={cn(
                  "prose prose-slate dark:prose-invert",
                  "prose-headings:font-bold",
                  "prose-code:text-indigo-600 dark:prose-code:text-indigo-400",
                  "prose-pre:bg-slate-950 prose-pre:text-slate-50",
                  "prose-pre:shadow-lg prose-pre:border-2",
                  "max-w-none",
                  isStreaming && [
                    "[&_p:last-child]:after:content-['▍']",
                    "[&_p:last-child]:after:inline-block",
                    "[&_p:last-child]:after:ml-1",
                    "[&_p:last-child]:after:text-indigo-500",
                    "[&_p:last-child]:after:animate-pulse",
                  ],
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{recommendation}</ReactMarkdown>
              </article>
              <div ref={bottomRef} className="h-2" />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-20 text-slate-400 italic">
              <InfoIcon className="mb-2 h-8 w-8 opacity-20" />
              <p>Select an assertion to view its audit intelligence.</p>
            </div>
          )}
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
  )
}
