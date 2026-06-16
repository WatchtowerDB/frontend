// I am painfully aware that we have libraries that handle markdown already.
// However, it would not be compatible with the search idea for now.
// TODO: Find an alternative that DOES work with our libraries.

export function TextHighlighter({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return <>{text}</>

  const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
  const regex = new RegExp(`(${escapedSearch})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="text-foreground rounded-sm bg-amber-500/25 px-0.5 font-medium mix-blend-multiply dark:bg-amber-500/40 dark:mix-blend-screen"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function InlineMarkdown({ text, highlight = "" }: { text: string; highlight?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="text-foreground font-semibold">
              <TextHighlighter text={part.slice(2, -2)} search={highlight} />
            </strong>
          )
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs font-medium"
            >
              <TextHighlighter text={part.slice(1, -1)} search={highlight} />
            </code>
          )
        }
        return (
          <span key={i}>
            <TextHighlighter text={part} search={highlight} />
          </span>
        )
      })}
    </>
  )
}

export function SubsectionContent({
  content,
  highlight = "",
}: {
  content: string
  highlight?: string
}) {
  const blocks = content.split("\n\n")

  return (
    <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        if (block.trim().startsWith("> ")) {
          return (
            <div
              key={i}
              className="border-primary/60 bg-muted/50 my-1 rounded-lg border-l-4 px-4 py-3"
            >
              <div className="text-foreground text-sm">
                <InlineMarkdown text={block.replace(/^>\s*/, "")} highlight={highlight} />
              </div>
            </div>
          )
        }

        if (block.trim().match(/^\d+\./)) {
          const items = block
            .split("\n")
            .filter(Boolean)
            .map((l) => l.replace(/^\d+\.\s*/, ""))
          return (
            <ol key={i} className="ml-5 list-outside list-decimal space-y-2">
              {items.map((item, ii) => (
                <li key={ii} className="pl-1">
                  <InlineMarkdown text={item} highlight={highlight} />
                </li>
              ))}
            </ol>
          )
        }

        if (block.trim().match(/^-\s/)) {
          const items = block
            .split("\n")
            .filter(Boolean)
            .map((l) => l.replace(/^-\s*/, ""))
          return (
            <ul key={i} className="ml-5 list-outside list-disc space-y-2">
              {items.map((item, ii) => (
                <li key={ii} className="pl-1">
                  <InlineMarkdown text={item} highlight={highlight} />
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i}>
            <InlineMarkdown text={block} highlight={highlight} />
          </p>
        )
      })}
    </div>
  )
}
