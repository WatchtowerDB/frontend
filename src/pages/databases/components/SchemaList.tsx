import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ClientDB, ClientDBSchema } from "@/types/compliance"

interface SchemaListProps {
  schemas: ClientDBSchema[]
  databases: ClientDB[]
  selectedSchemaId: number | null
  onSelect: (id: number) => void
}

export function SchemaList({ schemas, databases, selectedSchemaId, onSelect }: SchemaListProps) {
  return (
    <div className="px-8 pb-8">
      <Table>
        <TableHeader className="bg-background sticky top-0">
          <TableRow>
            <TableHead className="w-1/2">Name</TableHead>
            <TableHead className="w-1/2">Database</TableHead>
            <TableHead className="w-1/2">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemas?.map((dbSchema) => {
            const dbName =
              databases.find((db) => db.id === dbSchema.client_db)?.name ||
              `DB ${dbSchema.client_db}`
            console.log(dbName)
            return (
              <TableRow
                key={dbSchema.id}
                onClick={() => onSelect(dbSchema.id)}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedSchemaId === dbSchema.id ? "bg-accent" : "",
                )}
              >
                <TableCell className="font-medium">
                  {dbSchema.name} v{dbSchema.internal_version}
                </TableCell>
                <TableCell className="font-medium">{dbName}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(dbSchema.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
