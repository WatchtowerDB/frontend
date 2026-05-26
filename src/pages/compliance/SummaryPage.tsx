import { initModel } from "@/api/model"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircleIcon } from "lucide-react"
import { useState } from "react"

export default function SummaryPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  const handleInit = async () => {
    setLoading(true)
    try {
      const result = await initModel()
      setData(result)
    } catch (err) {
      console.error("Failed to ignite engine", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="space-y-2 p-4">
        <div className="flex flex-row gap-2">
          <AlertCircleIcon />
          <Label htmlFor="audit-log-toggle" className={`text-xs font-medium`}>
            Warning: Running this will crash the backend.
          </Label>
        </div>
        <Button onClick={handleInit} disabled={loading}>
          {loading ? "Igniting..." : "Initialize Model (or kill it)"}
        </Button>
        {data && <pre className="font-mono text-xs">{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </div>
  )
}
