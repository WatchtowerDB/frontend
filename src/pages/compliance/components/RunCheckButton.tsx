import { useRunComplianceCheck } from "@/hooks/useChecks"

export function RunCheckButton() {
  const { mutate, isPending } = useRunComplianceCheck()

  return (
    <button
      onClick={() => mutate({ frameworkId: 1, schemaId: 1 })}
      disabled={isPending}
      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
    >
      {isPending ? "Starting…" : "Run Compliance Check"}
    </button>
  )
}
