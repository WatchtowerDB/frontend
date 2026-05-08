import { DataList } from "@/components/DataList"
import { Badge } from "@/components/ui/badge"
import { useAssertions } from "@/hooks/useAssertions"
import { type AssertionItem } from "@/types/compliance"

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
    <DataList<AssertionItem>
      // className="max-w-screen"
      data={data?.results || []}
      onItemClick={(item) => onSelect?.(item.id)}
      renderTitle={(item) => (
        <span className="block truncate font-mono text-xs">{item.sql_query}</span>
      )}
      renderDescription={(item) => `ID: ${item.id} • Check: ${item.compliance_check}`}
      renderBadge={(item) => (
        <Badge variant={item.result ? "outline" : "destructive"}>
          {item.result ? "Pass" : "Fail"}
        </Badge>
      )}
      // renderContent={(item) => <p className="line-clamp-1 text-xs italic">{item.recommendation}</p>}
      emptyMessage="No assertions found for this schema."
    />
  )
}

export default AssertionsList
