import { useTheme } from "@/context/ThemeProvider"
import { cn } from "@/lib/utils"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql"
import {
  stackoverflowDark as dark,
  colorBrewer as light,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import CopyButton from "./CopyButton"
import { ScrollArea } from "./ui/scroll-area"
// DARK MODE CANDIDATES:
// - nord
// - hybrid
// - stackoverflowDark

SyntaxHighlighter.registerLanguage("sql", sql)

export default function SqlBlock({
  query,
  label,
  copyButton = true,
  className,
}: {
  query: string
  label?: string
  copyButton?: boolean
  className?: string
}) {
  const { theme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div
      className={cn(
        "not-prose! border-border relative mb-6 rounded-md border-2 bg-(--syntax-bg) shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between px-3 pt-1">
        {label && (
          <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
            {label}
          </span>
        )}
        {copyButton && <CopyButton textToCopy={query} variant="ghost" size="xs" />}
      </div>
      <ScrollArea className="h-full w-full">
        <SyntaxHighlighter
          language="sql"
          style={isDark ? dark : light}
          customStyle={{
            margin: 0,
            padding: "0.30rem 1rem 1rem",
            fontSize: "0.8rem",
            background: "transparent",
            overflow: "visible",
          }}
          showLineNumbers
        >
          {query}
        </SyntaxHighlighter>
      </ScrollArea>
    </div>
  )
}
