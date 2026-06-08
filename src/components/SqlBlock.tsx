import { useTheme } from "@/context/ThemeProvider"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql"
import {
  stackoverflowDark as dark,
  colorBrewer as light,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import CopyButton from "./CopyButton"
// DARK MODE CANDIDATES:
// - nord
// - hybrid
// - stackoverflowDark

SyntaxHighlighter.registerLanguage("sql", sql)

export default function SqlBlock({ query, label }: { query: string; label: string }) {
  const { theme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div className="not-prose! relative mb-6">
      <span className="absolute top-2 left-3 z-10 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
        {label}
      </span>
      <CopyButton textToCopy={query} variant={"ghost"} className="absolute top-2 right-3" />
      <SyntaxHighlighter
        language="sql"
        style={isDark ? dark : light}
        customStyle={{
          margin: 0,
          padding: "1.75rem 1rem 1rem",
          fontSize: "0.8rem",
          borderRadius: "0.375rem",
          border: "2px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          background: "var(--syntax-bg)",
        }}
        showLineNumbers
      >
        {query}
      </SyntaxHighlighter>
    </div>
  )
}
