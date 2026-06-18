import SqlBlock from "@/components/SqlBlock"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql"
// DARK MODE CANDIDATES:
// - nord
// - hybrid
// - stackoverflowDark

SyntaxHighlighter.registerLanguage("sql", sql)

interface SchemaPreviewProps {
  content: string | null | undefined
  activeTab: string
  selectedInfo?: string
}

export function SchemaPreview({ content, activeTab, selectedInfo }: SchemaPreviewProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* <header className="flex h-14 items-center border-b px-6">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-400">
          SQL FILE PREVIEW
          {activeTab === "schemas" && selectedInfo && (
            <span className="ml-2 font-normal text-zinc-600">- {selectedInfo}</span>
          )}
        </h2>
      </header> */}

      {content ? (
        <SqlBlock
          query={content}
          label={selectedInfo}
          copyButton={false}
          className="h-full w-full border-none"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-500 italic">
          <p>No preview available.</p>

          <p className="text-xs">
            {activeTab === "upload"
              ? "Select a .sql file to preview its contents."
              : "Select a schema from the list to view its definition."}
          </p>
        </div>
      )}
    </div>
  )
}
