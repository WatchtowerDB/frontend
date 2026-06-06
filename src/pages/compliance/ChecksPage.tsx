import type { CheckFilters } from "@/api/check"
import Pagination from "@/components/Pagination"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useChecks } from "@/hooks/useChecks"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useState } from "react"

export default function ChecksPage() {
  const [filters, setFilters] = useState<CheckFilters>({
    page: 1,
    ordering: "-date",
    client_db: undefined,
    framework: undefined,
  })
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }
  const {
    data: checkData,
    isLoading: checkLoading,
    isError: checkError,
    isPlaceholderData,
  } = useChecks(filters)
  const { data: dbs, isLoading: dbsLoading, isError: dbsError } = useAllClientDBs()
  const totalCount = checkData?.count || 0
  const totalPages = Math.ceil(totalCount / (Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20))
  return (
    <TooltipProvider>
      <div className="flex h-full w-full flex-col">
        {/* <Table className="h-full">
          <TableHeader className="bg-background sticky top-0">
            <TableRow>
              <TableHead className="w-1/2">Database</TableHead>
              <TableHead className="w-1/2">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkData?.results?.map((check) => {
              const dbName =
                dbs?.results?.find((db) => db.id === check.client_db)?.name ||
                `DB ${check.client_db}`
              console.log(dbName)
              return (
                <TableRow
                  key={check.id}
                  onClick={() => console.log("Thing was clicked, not bad at all..")}
                  className={cn(
                    "cursor-pointer transition-colors",
                    //   selectedSchemaId === dbSchema.id ? "bg-accent" : "",
                  )}
                >
                  <TableCell className="font-medium">{dbName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(check.date).toLocaleString()}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table> */}
        {checkData?.results?.map((check) => {
          const dbName =
            dbs?.results?.find((db) => db.id === check.client_db)?.name || `DB ${check.client_db}`
          console.log(dbName)
          return (
            <Accordion key={check.id} type="single" collapsible>
              <AccordionItem value={String(check.id)}>
                <AccordionTrigger />
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
              </AccordionItem>
            </Accordion>
          )
        })}
        <div className="bg-card border-t p-4">
          <h2>Kill</h2>
          <Pagination
            page={filters.page || 1}
            totalPages={totalPages}
            totalCount={totalCount}
            isFetching={isPlaceholderData} // Use this to show a loading state on the buttons
            onPageChange={handlePageChange}
            size="sm"
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
