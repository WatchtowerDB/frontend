import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { RotateCw } from "lucide-react"
import { useState } from "react"

export function RefreshAssertionsButton() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 600)),

      queryClient.invalidateQueries({
        queryKey: ["assertions", "list"],
      }),
      // Injecting a 600ms artificial delay.
    ])
    setIsRefreshing(false)
  }

  return (
    <Button
      onClick={handleRefresh}
      variant={"outline"}
      disabled={isRefreshing}
      className="p-2 text-slate-500 transition-colors hover:text-slate-900 disabled:opacity-50 dark:hover:text-slate-100"
      aria-label="Refresh compilation audit data"
    >
      <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`} />
    </Button>
  )
}
