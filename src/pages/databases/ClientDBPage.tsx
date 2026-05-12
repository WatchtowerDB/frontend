import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useClientDBs } from "@/hooks/useClientDBs"
import { Edit, Plus, Trash2 } from "lucide-react"

export default function ClientDBPage() {
  const {
    rows,
    isLoading,
    hasChanges,
    isPending,
    addNewDB,
    startEditing,
    saveEdit,
    cancelEdit,
    updateField,
    removeDB,
    restoreDB,
    applyChanges,
    resetState,
  } = useClientDBs()

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="h-full w-full flex-col p-8">
      <header>
        <h1 className="text-2xl font-bold">Client Databases</h1>
        <p className="text-foreground">
          Manage the client databases that WTCE can connect to for testing.
        </p>
      </header>
      <main className="flex h-full w-full flex-col pt-4">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Connection String</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((db) => {
              const rowClassName = db.isDeleted
                ? "bg-rose-50"
                : db.isNew
                  ? "bg-emerald-50"
                  : db.hasLocalChanges
                    ? "bg-amber-50"
                    : ""

              const textClassName = db.isDeleted ? "line-through text-rose-900/80" : ""

              return (
                <TableRow key={db.id} className={rowClassName}>
                  <TableCell className="text-muted-foreground font-mono">
                    {db.isNew ? "" : db.id}
                  </TableCell>
                  <TableCell>
                    {db.isEditing ? (
                      <Input
                        value={db.name}
                        onChange={(e) => updateField(db.id, "name", e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Sorry this is a bit messy, I was drafting out ideas */}
                        <span className={textClassName}>
                          {db.name ||
                            "IF YOU CAN SEE THIS, THEN I FORGOT TO IMPLEMENT INPUT VALIDATION :D"}
                        </span>
                        {db.isNew ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                            New
                          </span>
                        ) : db.hasLocalChanges ? (
                          <span className="font-bold text-amber-700">*</span>
                        ) : null}
                        {db.isDeleted ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                            Deleted
                          </span>
                        ) : null}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {db.isEditing ? (
                      <Input
                        value={db.connection_string}
                        onChange={(e) => updateField(db.id, "connection_string", e.target.value)}
                      />
                    ) : (
                      <span className={textClassName}>
                        {db.connection_string ||
                          "IF YOU CAN SEE THIS, THEN I FORGOT TO IMPLEMENT INPUT VALIDATION :D"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {db.isDeleted ? (
                      <Button size="sm" variant="outline" onClick={() => restoreDB(db.id)}>
                        Undo
                      </Button>
                    ) : db.isEditing ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(db.id)}>
                          Done
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => cancelEdit(db.id)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEditing(db.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeDB(db.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          {/* Ghost cell for adding a new database */}
          <TableFooter className="border-none">
            <TableRow>
              <TableCell colSpan={4} className="w-full p-0">
                <button
                  onClick={addNewDB}
                  // TODO: fix this shit
                  className="m-0 flex w-full items-center justify-center border-t-2 border-dashed border-gray-300 p-0 dark:border-gray-600"
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4" />
                  &nbsp; Add Database
                </button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {hasChanges && (
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={resetState} disabled={isPending}>
              Cancel All
            </Button>
            <Button onClick={applyChanges} disabled={isPending}>
              Apply Changes
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
