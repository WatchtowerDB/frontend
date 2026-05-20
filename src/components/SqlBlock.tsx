export default function SqlBlock({ query, label }: { query: string; label: string }) {
  return (
    <div className="relative mb-6">
      <span className="absolute top-2 left-3 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
        {label}
      </span>
      <pre className="overflow-x-auto rounded-md border-2 bg-slate-950 p-4 pt-7 text-sm break-all whitespace-pre-wrap text-slate-50 shadow-lg">
        <code>{query}</code>
      </pre>
    </div>
  )
}
