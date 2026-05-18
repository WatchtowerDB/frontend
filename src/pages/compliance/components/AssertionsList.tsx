import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAssertions } from "@/hooks/useAssertions"

interface AssertionListProps {
  onSelect?: (item: number) => void
  selectedId?: number | null
}

const AssertionsList = ({ onSelect, selectedId }: AssertionListProps) => {
  const { assertions, isLoading, isError, error, isFetching } = useAssertions()

  if (isLoading) return <div className="animate-pulse p-4 text-xs">Scanning assertions...</div>
  if (isError)
    return <div className="text-destructive p-4 text-xs">Failed to load: {error.message}</div>

  return (
    <div className="relative flex flex-col">
      {isFetching && <div className="text-muted-foreground px-4 py-1 text-[10px]">Updating…</div>}

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu
            className={`gap-1 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {assertions.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={selectedId === item.id}
                  className="h-auto flex-col items-start gap-1 border-b p-0 last:border-b-0"
                >
                  <button
                    onClick={() => onSelect?.(item.id)}
                    className={`flex w-full flex-col items-start gap-1 p-4 backdrop-blur-sm ${
                      item.result
                        ? "border-l-4 border-emerald-500 bg-linear-to-br from-emerald-500/15 via-emerald-500/5 via-10% to-transparent to-15%"
                        : "border-l-4 border-red-500 bg-linear-to-br from-red-500/15 via-red-500/5 via-10% to-transparent to-15%"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="truncate text-left font-mono text-xs">
                        {item.id} • {item.sql_query}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-left text-[10px]">
                      Client DB: {item.client_db}
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}

export default AssertionsList
