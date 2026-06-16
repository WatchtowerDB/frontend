import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, HelpCircle, Search, Zap } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { quickRunSteps, sections } from "./components/HelpData"
import { InlineMarkdown, SubsectionContent, TextHighlighter } from "./components/MarkdownRenderers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Subsection {
  title: string
  content: string
}

export interface Section {
  id: string
  icon: React.ReactNode
  title: string
  subsections: Subsection[]
}

export interface QuickRunStep {
  number: number
  title: string
  description: string
  icon: React.ReactNode
  tip?: string
}

// ─── Subsection accordion ─────────────────────────────────────────────────────

function SubsectionAccordion({ sub }: { sub: Subsection }) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-border/60 bg-card overflow-hidden rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md">
        <CollapsibleTrigger className="hover:bg-muted/40 flex w-full items-center justify-between px-5 py-4 text-left transition-colors">
          <span className="text-foreground text-sm font-semibold tracking-tight">{sub.title}</span>
          <ChevronDown
            className={`text-muted-foreground size-4 transition-transform duration-200 ease-in-out ${
              open ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-border/40 bg-muted/10 border-t px-5 pt-4 pb-5">
            <SubsectionContent content={sub.content} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

// ─── Quick Run section ────────────────────────────────────────────────────────

function QuickRunSection() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">
      <div className="border-border/40 mb-8 flex items-center gap-4 border-b pb-5">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-inner">
          <Zap className="size-4" />
        </div>
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Quick Run</h1>
        </div>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        New here? Follow these five steps to go from zero to a full compliance report.
      </p>

      <div className="flex flex-col gap-3">
        {quickRunSteps.map((step, idx) => (
          <div key={step.number} className="flex gap-4">
            {/* Step spine */}
            <div className="flex shrink-0 flex-col items-center">
              <div className="bg-primary text-primary-foreground z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {step.number}
              </div>
              {idx < quickRunSteps.length - 1 && <div className="bg-border/60 mt-1 w-px flex-1" />}
            </div>

            {/* Step card */}
            <div className="border-border/60 bg-card mb-3 flex flex-1 flex-col gap-1.5 rounded-lg border px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="text-muted-foreground flex items-center gap-2">
                {step.icon}
                <span className="text-foreground text-sm font-semibold tracking-tight">
                  {step.title}
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                <InlineMarkdown text={step.description} />
              </p>
              {step.tip && (
                <p className="text-muted-foreground/70 mt-0.5 text-xs italic">{step.tip}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function Help() {
  const [activeId, setActiveId] = useState<string>("home")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [debouncedQuery, setDebouncedQuery] = useState<string>("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 200)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const currentSection = sections.find((s) => s.id === activeId)

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const query = debouncedQuery.toLowerCase()
    const flatList: Array<{
      sectionId: string
      sectionTitle: string
      icon: React.ReactNode
      title: string
      content: string
    }> = []

    sections.forEach((sec) => {
      sec.subsections.forEach((sub) => {
        if (sub.title.toLowerCase().includes(query) || sub.content.toLowerCase().includes(query)) {
          flatList.push({
            sectionId: sec.id,
            sectionTitle: sec.title,
            icon: sec.icon,
            title: sub.title,
            content: sub.content,
          })
        }
      })
    })

    return flatList
  }, [debouncedQuery])

  return (
    <div className="bg-background flex h-full min-h-0 w-full flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="border-border/40 bg-card/40 flex hidden h-full w-64 flex-col border-r md:flex">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-muted-foreground mb-4 px-3 text-xs font-bold tracking-wider uppercase">
            Documentation
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveId("home")
                setSearchQuery("")
                setDebouncedQuery("")
              }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-all ${
                activeId === "home"
                  ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span
                className={`transition-colors ${activeId === "home" ? "text-primary" : "text-muted-foreground"}`}
              >
                <HelpCircle className="size-4" />
              </span>
              <span>Search & Overview</span>
            </button>

            <div className="bg-border/40 my-3 h-px" />

            {sections.map((s) => {
              const isActive = activeId === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {s.icon}
                  </span>
                  <span>{s.title}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main panel */}
      <div className="bg-background flex h-full min-h-0 flex-1 flex-col">
        <ScrollArea className="max-h-full min-h-0 flex-1">
          <main className="mx-auto w-full px-6 py-10 md:px-12 lg:py-14">
            {/* Home hub */}
            {activeId === "home" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
                <div className="border-border/40 border-b pb-5">
                  <div className="mb-2 flex items-center gap-3"></div>
                  <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
                    Watchtower Help Center
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Access comprehensive documentation and troubleshooting protocols to enforce
                    maximum protection over your database architecture.
                  </p>
                </div>

                <div className="relative">
                  <Search className="text-muted-foreground absolute top-3.5 left-4 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search the documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-border bg-card placeholder:text-muted-foreground/70 focus:ring-primary/40 focus:border-primary w-full rounded-xl border py-3.5 pr-4 pl-12 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:outline-none"
                  />
                </div>

                {searchQuery.trim() ? (
                  <div className="space-y-4">
                    <h2 className="text-muted-foreground px-1 text-xs font-bold tracking-wider uppercase">
                      Query Results ({searchResults.length})
                    </h2>
                    {searchResults.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {searchResults.map((result, i) => (
                          <div
                            key={i}
                            className="border-border/60 bg-card animate-in fade-in overflow-hidden rounded-xl border shadow-sm duration-200"
                          >
                            <div className="bg-muted/40 border-border/40 flex items-center justify-between border-b px-5 py-2.5 text-xs">
                              <div className="text-muted-foreground flex items-center gap-2 font-medium">
                                {result.icon}
                                <span>{result.sectionTitle}</span>
                              </div>
                              <button
                                onClick={() => setActiveId(result.sectionId)}
                                className="text-primary font-semibold hover:underline"
                              >
                                Jump to module &rarr;
                              </button>
                            </div>
                            <div className="px-5 pt-3 pb-4">
                              <h3 className="text-foreground mb-2 text-sm font-bold">
                                <TextHighlighter text={result.title} search={debouncedQuery} />
                              </h3>
                              <SubsectionContent
                                content={result.content}
                                highlight={debouncedQuery}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-border bg-card/30 rounded-xl border border-dashed py-12 text-center">
                        <p className="text-muted-foreground text-sm">
                          No records matched your query parameters.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveId(s.id)}
                        className="border-border/60 bg-card hover:border-primary/30 group rounded-xl border p-5 text-left shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 w-fit rounded-lg p-2 transition-colors">
                          {s.icon}
                        </div>
                        <h3 className="text-foreground mb-1 text-sm font-bold">{s.title}</h3>
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {s.id === "quick-run"
                            ? "Step-by-step walkthrough from setup to your first compliance report."
                            : `View details regarding ${s.subsections.map((sub) => sub.title).join(", ")}.`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Run */}
            {activeId === "quick-run" && <QuickRunSection />}

            {/* Standard section */}
            {activeId !== "home" && activeId !== "quick-run" && currentSection && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border-border/40 mb-8 flex items-center gap-4 border-b pb-5">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-inner">
                    {currentSection.icon}
                  </div>
                  <div>
                    <h1 className="text-foreground text-2xl font-bold tracking-tight">
                      {currentSection.title}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {currentSection.subsections.map((sub, i) => (
                    <SubsectionAccordion key={i} sub={sub} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}
