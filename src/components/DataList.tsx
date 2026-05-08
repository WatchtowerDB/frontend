import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import * as React from "react"

interface CardListProps<T> {
  data: T[]
  renderTitle: (item: T) => React.ReactNode
  renderDescription?: (item: T) => React.ReactNode
  renderBadge?: (item: T) => React.ReactNode
  renderContent?: (item: T) => React.ReactNode
  onItemClick?: (item: T) => void
  emptyMessage?: string
  className?: string
}

export function DataList<T>({
  data,
  renderTitle,
  renderDescription,
  renderBadge,
  renderContent,
  onItemClick,
  emptyMessage = "Nothing found.",
  className,
}: CardListProps<T>) {
  return (
    <ScrollArea className={cn("bg-background h-full w-full border", className)}>
      <div className="flex flex-col">
        {data.length > 0 ? (
          data.map((item, index) => (
            <Card
              key={index}
              className={cn(
                "rounded-none transition-all duration-200",
                onItemClick && "hover:bg-accent hover:text-accent-foreground cursor-pointer",
              )}
              onClick={() => onItemClick?.(item)}
            >
              <div className="space-y-3 p-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 overflow-hidden">
                    <div className="leading-none font-semibold tracking-tight">
                      {renderTitle(item)}
                    </div>
                    {renderDescription && (
                      <div className="text-muted-foreground text-xs">{renderDescription(item)}</div>
                    )}
                  </div>
                  {renderBadge && <div className="shrink-0">{renderBadge(item)}</div>}
                </div>

                {/* Content Row */}
                {renderContent && (
                  <div className="text-muted-foreground text-sm">{renderContent(item)}</div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
            {emptyMessage}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
