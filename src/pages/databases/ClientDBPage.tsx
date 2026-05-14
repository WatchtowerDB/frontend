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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useClientDBs } from "@/hooks/useClientDBs"
import { cn } from "@/lib/utils"
import { Check, Edit, History, Plus, Trash2, Undo2, X } from "lucide-react"

export default function ClientDBPage() {
  const {
    rows,
    isLoading,
    hasChanges,
    isPending,
    addNewDB,
    startEditing,
    saveEdit,
    revertRow,
    cancelEdit,
    updateField,
    removeDB,
    restoreDB,
    applyChanges,
    resetState,
    page,
    totalCount,
    hasNext,
    hasPrevious,
    setPage,
  } = useClientDBs()

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col p-8">
      <header>
        <h1 className="text-2xl font-bold">Client Databases</h1>
        <p className="text-foreground">
          Manage the client databases that WTCE can connect to for testing.
        </p>
      </header>
      <main className="flex h-full min-h-0 w-full flex-col pt-4">
        <div className="relative w-full flex-1 overflow-y-auto border">
          <Table noWrapper className="min-h-full w-full border-collapse">
            <TableHeader className="bg-background sticky top-0">
              <TableRow>
                <TableHead className="w-[5%] pl-3">ID</TableHead>
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[60%]">Connection String</TableHead>
                <TableHead className="w-[10%] pr-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((db) => {
                const rowClassName = db.isDeleted
                  ? "bg-rose-50 dark:bg-red-900"
                  : db.isNew
                    ? "bg-emerald-50 dark:bg-emerald-800"
                    : db.hasLocalChanges
                      ? "bg-amber-50 dark:bg-yellow-800"
                      : ""

                const textClassName = db.isDeleted
                  ? "line-through text-rose-900/80 dark:text-white"
                  : ""

                return (
                  <TableRow key={db.id} className={rowClassName}>
                    <TableCell className="text-muted-foreground pl-3 font-mono">
                      {db.isNew ? "" : db.id}
                    </TableCell>
                    <TableCell>
                      {db.isEditing ? (
                        <Input
                          value={db.name}
                          onChange={(e) => updateField(db.id, "name", e.target.value)}
                          placeholder="e.g., Production"
                          required
                        />
                      ) : (
                        <span className={textClassName}>{db.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {db.isEditing ? (
                        <Input
                          value={db.connection_string}
                          onChange={(e) => updateField(db.id, "connection_string", e.target.value)}
                          placeholder="e.g., postgresql://user:password@localhost:5432/database"
                          required
                        />
                      ) : (
                        <span className={textClassName}>{db.connection_string}</span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end pr-3">
                      <TooltipProvider>
                        {db.isDeleted ? (
                          <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreDB(db.id)}
                                aria-label="Undo Deletion"
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Undo Deletion</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : db.isEditing ? (
                          <div className="flex gap-2">
                            <Tooltip delayDuration={500}>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(db.id)}
                                  disabled={!db.name?.trim() || !db.connection_string?.trim()}
                                  aria-label="Save"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Save</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip delayDuration={500}>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelEdit(db.id)}
                                  aria-label="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cancel</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Tooltip delayDuration={500}>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(db.id)}
                                  aria-label="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                            {db.hasLocalChanges && !db.isNew ? (
                              <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => revertRow(db.id)}
                                    aria-label="Discard Changes"
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Discard Changes</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeDB(db.id)}
                                    aria-label="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            {/* Ghost cell for adding a new database */}
            <TableFooter className="sticky bottom-0 h-full border-none backdrop-blur-[128px]">
              <TableRow className="h-full">
                <TableCell colSpan={4} className="h-full w-full p-0">
                  <button
                    onClick={addNewDB}
                    className="m-0 flex h-full min-h-11 w-full items-center justify-center border-t-2 border-dashed border-gray-300 p-0 dark:border-gray-700"
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                    &nbsp; Add Database
                  </button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-muted-foreground text-sm">
            Showing {rows.length} records (Total {totalCount})
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Page {page}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrevious || isPending}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext || isPending}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className={cn("mt-4 flex justify-end gap-2", hasChanges ? "" : "invisible")}>
          <Button
            onClick={applyChanges}
            disabled={
              isPending ||
              rows.some((db) => db.isEditing) ||
              rows.some(
                (db) => !db.isDeleted && (!db.name?.trim() || !db.connection_string?.trim()),
              )
            }
            aria-label="Apply"
          >
            Apply
          </Button>
          <Button variant="outline" onClick={resetState} disabled={isPending} aria-label="Cancel">
            Cancel
          </Button>
        </div>
      </main>
    </div>
  )
}
