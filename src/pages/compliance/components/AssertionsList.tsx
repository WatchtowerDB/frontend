// src/pages/compliance/AssertionsList.tsx
import { DataList } from "@/components/DataList"

type AssertionItem = {
  id: string
  name: string
  schema: string
  status: "pass" | "fail"
}

// 🔥 Dummy data
const MOCK_ASSERTIONS: AssertionItem[] = [
  {
    id: "1",
    name: "User must have email",
    schema: "users",
    status: "pass",
  },
  {
    id: "2",
    name: "Order must have valid total",
    schema: "orders",
    status: "fail",
  },
  {
    id: "3",
    name: "Product must have price",
    schema: "products",
    status: "pass",
  },
  {
    id: "4",
    name: "Customer must have address",
    schema: "customers",
    status: "fail",
  },
]

const AssertionsList = () => {
  return (
    <div className="rounded-md border p-2 shadow-xl">
      <DataList
        data={MOCK_ASSERTIONS}
        emptyMessage="No assertions found."
        columns={[
          {
            header: "Assertion",
            render: (a) => <span className="font-medium">{a.name}</span>,
          },
          {
            header: "Schema",
            render: (a) => <span className="text-muted-foreground">{a.schema}</span>,
          },
          {
            header: "Status",
            render: (a) => (
              <span
                className={`text-sm font-medium ${
                  a.status === "pass" ? "text-green-600" : "text-red-600"
                }`}
              >
                {a.status.toUpperCase()}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}

export default AssertionsList
