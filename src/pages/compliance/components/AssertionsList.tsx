import { Badge } from "@/components/ui/badge"
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

// 🔥 Dummy data
// const MOCK_ASSERTIONS: AssertionItem[] = [
//   {
//     id: "1",
//     name: "User must have email",
//     schema: "users",
//     status: "pass",
//   },
//   {
//     id: "2",
//     name: "Order must have valid total",
//     schema: "orders",
//     status: "fail",
//   },
//   {
//     id: "3",
//     name: "Product must have price",
//     schema: "products",
//     status: "pass",
//   },
//   {
//     id: "4",
//     name: "Customer must have address",
//     schema: "customers",
//     status: "fail",
//   },
// ]

const AssertionsList = ({ onSelect, selectedId }: AssertionListProps) => {
  const { data, isLoading, isError, error } = useAssertions({
    // schema: selectedSchema ?? undefined,
    // result: showOnlyFailures ? false : undefined, // Optional filter
  })

  if (isLoading) return <div className="animate-pulse p-4 text-xs">Scanning assertions...</div>
  if (isError)
    return <div className="text-destructive p-4 text-xs">Failed to load: {error.message}</div>

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {data?.results.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={selectedId === item.id}
                className="h-auto flex-col items-start gap-1 border-b p-0 last:border-b-0"
              >
                <button
                  onClick={() => onSelect?.(item.id)}
                  className="flex w-full flex-col items-start gap-1 p-4"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="truncate text-left font-mono text-xs">{item.sql_query}</span>
                    <Badge variant={item.result ? "outline" : "destructive"} className="ml-2">
                      {item.result ? "Pass" : "Fail"}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-left text-[10px]">
                    ID: {item.id} • {item.compliance_check}
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default AssertionsList
