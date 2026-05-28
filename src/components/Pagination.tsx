import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface PaginationProps {
  page: number
  totalPages: number
  totalCount?: number
  isFetching?: boolean
  onPageChange: (page: number) => void
  size?: "sm" | "xs"
  showTotal?: boolean
  className?: string
}

export default function Pagination({
  page,
  totalPages,
  totalCount,
  isFetching,
  onPageChange,
  size = "sm",
  showTotal = true,
  className,
}: PaginationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputVal, setInputVal] = useState(String(page))

  const handleJump = () => {
    setIsEditing(false)
    const parsed = parseInt(inputVal)
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed)
    } else {
      setInputVal(String(page))
    }
  }

  const isXs = size === "xs"
  const btnSize = isXs ? "h-6 w-6" : "h-8 w-8"
  const iconSize = isXs ? "h-3 w-3" : "h-4 w-4"
  const textSize = isXs ? "text-[10px]" : "text-sm"
  const inputWidth = isXs ? "w-6" : "w-8"

  if (totalPages <= 1) return null

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {showTotal && totalCount !== undefined && (
        <span className={cn("text-muted-foreground", textSize)}>{totalCount} total</span>
      )}
      <div className={cn("ml-auto flex items-center gap-2")}>
        <div className="flex flex-row items-center gap-1">
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={btnSize}
                disabled={page <= 1 || isFetching}
                onClick={() => onPageChange(1)}
                aria-label="First page"
              >
                <ChevronFirst className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>First page</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={btnSize}
                disabled={page <= 1 || isFetching}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous page</TooltipContent>
          </Tooltip>
          <span className={`text-muted-foreground ${textSize}`}>
            Page{" "}
            <input
              className={`${inputWidth} rounded border bg-transparent text-center ${textSize} align-middle`}
              value={isEditing ? inputVal : String(page)}
              onChange={(e) => {
                setIsEditing(true)
                setInputVal(e.target.value)
              }}
              onBlur={handleJump}
              onKeyDown={(e) => e.key === "Enter" && handleJump()}
              disabled={isFetching}
            />{" "}
            of {totalPages}
          </span>
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={btnSize}
                disabled={page >= totalPages || isFetching}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next page</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={btnSize}
                disabled={page >= totalPages || isFetching}
                onClick={() => onPageChange(totalPages)}
                aria-label="Last page"
              >
                <ChevronLast className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Last page</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
