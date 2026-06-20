import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertTitle } from "@/components/ui/alert"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { ClientDB, ClientDBSchema } from "@/types/compliance"
import { useMemo } from "react"

interface SchemaListProps {
  schemas: ClientDBSchema[]
  databases: ClientDB[]
  selectedSchemaId: number | null
  onSelect: (id: number) => void
}

export function SchemaList({ schemas, databases, selectedSchemaId, onSelect }: SchemaListProps) {
  const databaseMap = useMemo(() => {
    return new Map(databases.map((db) => [db.id, db.name]))
  }, [databases])

  if (!schemas || schemas.length === 0) {
    return (
      <div className="flex min-h-[150px] w-full flex-1 items-center justify-center p-4">
        <Alert
          variant="default"
          className="border-muted flex w-full max-w-60 flex-row items-center justify-center gap-2 bg-neutral-500/5 py-3 text-center backdrop-blur-xs"
        >
          <AlertTitle className="text-muted-foreground mb-0 pb-0 font-mono text-xs leading-none font-semibold tracking-wider uppercase">
            No Schemas Found
          </AlertTitle>
        </Alert>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col px-3">
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <Accordion
            type="single"
            collapsible
            value={selectedSchemaId?.toString() ?? ""}
            onValueChange={(val) => val && onSelect(parseInt(val, 10))}
            className="w-full"
          >
            <SidebarMenu className="mb-3 gap-1">
              {schemas.map((dbSchema) => {
                const dbName = databaseMap.get(dbSchema.client_db) ?? `DB ${dbSchema.client_db}`
                const isSelected = selectedSchemaId === dbSchema.id
                const stringId = dbSchema.id.toString()
                const formattedDate = new Date(dbSchema.created_at).toLocaleString()
                const hasDescription = dbSchema.description?.trim()

                return (
                  <SidebarMenuItem key={dbSchema.id}>
                    <AccordionItem value={stringId} className="border-none">
                      <SidebarMenuButton
                        asChild
                        isActive={isSelected}
                        className={cn(
                          "block h-auto p-0 transition-colors last:border-b-0",
                          isSelected
                            ? "dark:bg-accent bg-neutral-200/60 font-medium"
                            : "hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50",
                        )}
                      >
                        <div className="w-full">
                          {/* If needed, you may change the chevron behaviors from within the accordion component but for now [&>svg]:hidden! does the trick */}
                          <AccordionTrigger
                            className={cn(
                              "flex w-full flex-row items-center justify-between p-4 text-left backdrop-blur-sm transition-all hover:no-underline [&>svg]:hidden!",
                              "bg-linear-to-br from-neutral-500/5 via-transparent to-transparent",
                              isSelected && "rounded-b-none",
                            )}
                          >
                            <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
                              <span className="text-foreground truncate font-mono text-sm font-medium">
                                {dbSchema.name}{" "}
                                <span className="text-muted-foreground text-xs font-normal">
                                  v{dbSchema.internal_version}
                                </span>
                              </span>

                              <span className="text-muted-foreground font-mono text-[11px] font-normal">
                                Database: <span className="text-foreground">{dbName}</span>
                                {" • "}
                                Created: <span className="text-foreground">{formattedDate}</span>
                              </span>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="w-full pb-0">
                            <div className="text-muted-foreground block px-4 pt-1 pb-4 font-sans text-xs leading-relaxed wrap-break-word whitespace-pre-wrap">
                              {hasDescription ? (
                                <p className="block w-full text-left wrap-break-word whitespace-pre-wrap">
                                  {dbSchema.description}
                                </p>
                              ) : (
                                <p className="text-neutral-400 italic dark:text-neutral-500">
                                  No description provided for this schema.
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </div>
                      </SidebarMenuButton>
                    </AccordionItem>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </Accordion>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
