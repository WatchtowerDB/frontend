import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAssertions } from "@/hooks/useAssertions"
import { useAssertionStore } from "@/stores/useAssertionStore"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"

export default function AssertionsFooter() {
  const { totalPages, totalCount, isFetching } = useAssertions()

  const page = useAssertionStore((s) => s.page)
  const setPage = useAssertionStore((s) => s.setPage)
  console.log(totalPages)

  return (
    <TooltipProvider>
      {/* Pagination used in the Assertions List */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-2">
          <span className="text-muted-foreground text-[10px]">
            Page {page} of {totalPages} · {totalCount} total
          </span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage(1)}
                  aria-label="First page"
                >
                  <ChevronFirst className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>First page</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous page</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage(page + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next page</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage(totalPages)}
                  aria-label="Last page"
                >
                  <ChevronLast className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Last page</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
