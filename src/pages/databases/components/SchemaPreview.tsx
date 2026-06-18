import SqlBlock from "@/components/SqlBlock"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql"

SyntaxHighlighter.registerLanguage("sql", sql)

interface SchemaPreviewProps {
  content: string | null | undefined
  activeTab: string
  selectedInfo?: string
}

export function SchemaPreview({ content, activeTab, selectedInfo }: SchemaPreviewProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
