import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useLatestCheck } from "@/hooks/useChecks"
import { cn } from "@/lib/utils"
import { useAssertionStore } from "@/stores/useAssertionStore"

interface ViewLatestCheckProps {
  className?: string
}

export default function ViewLatestCheck({ className }: ViewLatestCheckProps) {
  const { data: latestCheck } = useLatestCheck()
  const latestCheckId = latestCheck?.id

  const complianceCheckId = useAssertionStore((s) => s.complianceCheckId)
  const setComplianceCheckId = useAssertionStore((s) => s.setComplianceCheckId)
  const isChecked = latestCheckId ? complianceCheckId === latestCheckId : false

  const handleCheckedChange = (checkedValue: boolean | "indeterminate") => {
    if (!latestCheckId) return

    if (checkedValue === true) {
      setComplianceCheckId(latestCheckId)
    } else {
      setComplianceCheckId(null)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        id="audit-log-toggle"
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={!latestCheckId}
      />
      <Label
        htmlFor="audit-log-toggle"
        className={`text-xs font-medium ${!latestCheckId ? "text-muted-foreground/50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        View Latest Compliance Check {latestCheckId && `(#${latestCheckId})`}
      </Label>
    </div>
  )
}
