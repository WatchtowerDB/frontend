import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useRunComplianceCheck } from "@/hooks/useChecks"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { useFrameworks } from "@/hooks/useFrameworks"
import type { ClientDBSchema } from "@/types/compliance"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const schema = z.object({
  frameworkId: z.number({ message: "Select a framework" }),
  clientDbId: z.number({ message: "Select a client database" }),
  schemaName: z.string().min(1, { message: "Select a schema" }),
})

type RunCheckForm = z.infer<typeof schema>

interface RunCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RunCheckDialog({ open, onOpenChange }: RunCheckDialogProps) {
  const [resolvingSchema, setResolvingSchema] = useState(false)
  const [resolutionError, setResolutionError] = useState<string | null>(null)

  // Fetching frameworks and clientDbs to populate the dropdowns.
  const { data: frameworks, isLoading: frameworksLoading } = useFrameworks()
  const { data: clientDbs, isLoading: clientDbsLoading } = useAllClientDBs()

  const { mutate, isPending: isMutationPending } = useRunComplianceCheck()

  const form = useForm<RunCheckForm>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      frameworkId: undefined,
      clientDbId: undefined,
      schemaName: "",
      // Schema name's empty is "" because it is not an ID like the rest + so changing DB invalidates schemaName.
    },
  })

  // To disable submission if nothing is selected.
  const [watchedFrameworkId, watchedClientDbId, watchedSchemaName] = useWatch({
    control: form.control,
    name: ["frameworkId", "clientDbId", "schemaName"],
  }) as [number, number, string]
  const hasNoSelection = !watchedFrameworkId || !watchedClientDbId || !watchedSchemaName

  const dbId = watchedClientDbId || null
  const { data: schemas, isLoading: schemasLoading } = useAllClientDBSchemas(
    dbId ? { client_db: [dbId], latest: true } : undefined,
  )
  const uniqueSchemas = (schemas?.results || []) as ClientDBSchema[]

  const onSubmit = async (values: RunCheckForm) => {
    setResolvingSchema(true)
    setResolutionError(null)
    console.log("something trigeodfhsdophfs")

    try {
      mutate(
        {
          frameworkId: values.frameworkId,
          schemaName: values.schemaName,
          clientDbId: values.clientDbId,
        },
        {
          onSuccess: () => {
            toast.success("Compliance check initiated succcessfully!", {
              duration: 3000,
            })
            onOpenChange(false)
          },
        },
      )
    } catch (err) {
      setResolutionError("Failed to fetch schemas for evaluation.")
    } finally {
      setResolvingSchema(false)
    }
  }

  const isWorking = isMutationPending || resolvingSchema
  const noFrameworks = !frameworksLoading && frameworks?.results?.length === 0
  const noDatabases = !clientDbsLoading && clientDbs?.results?.length === 0
  const noSchemas = !schemasLoading && dbId && schemas?.results?.length === 0

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setResolutionError(null)
        onOpenChange(val)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run Compliance Check</DialogTitle>
          <DialogDescription>Initiate a compliance check on a database.</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Client Database Selector */}
            <Controller
              control={form.control}
              name="clientDbId"
              render={({ field, fieldState }) => {
                const databaseItems = clientDbs?.results || []

                return (
                  <Field>
                    <FieldLabel>Client Database</FieldLabel>
                    <Combobox
                      items={databaseItems}
                      itemToStringLabel={(db) => db?.name ?? ""}
                      value={databaseItems.find((db) => db.id === field.value) ?? null}
                      onValueChange={(db) => {
                        console.log("Fixed the issue")
                        field.onChange(db ? db.id : undefined)
                        form.setValue("schemaName", "")
                        if (resolutionError) setResolutionError(null)
                      }}
                    >
                      <ComboboxInput
                        showClear
                        showClearCondition={!!field.value}
                        placeholder={clientDbsLoading ? "Loading..." : "Select a database..."}
                        disabled={noDatabases || clientDbsLoading}
                      />
                      <ComboboxContent
                        onWheel={(e) => e.stopPropagation()}
                        className="pointer-events-auto"
                      >
                        <ComboboxEmpty>No databases found.</ComboboxEmpty>
                        <ComboboxList>
                          {(db) => (
                            <ComboboxItem
                              key={db.id}
                              value={db}
                              onClick={() => console.log("clicked", db)}
                            >
                              {db.name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                  </Field>
                )
              }}
            />
            {/* Schema Selector */}
            <Controller
              control={form.control}
              name="schemaName"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Schema</FieldLabel>
                  <Combobox
                    items={uniqueSchemas}
                    itemToStringLabel={(schema: string) => {
                      if (!schema) return ""
                      if (typeof schema === "string") return schema
                      return (schema as ClientDBSchema).name
                    }}
                    value={field.value || ""}
                    onValueChange={(v) => {
                      field.onChange(v || "")
                      if (resolutionError) setResolutionError(null)
                    }}
                  >
                    <ComboboxInput
                      showClear
                      showClearCondition={typeof field.value === "string" && field.value.length > 0}
                      placeholder={
                        schemasLoading
                          ? "Loading..."
                          : dbId
                            ? "Select a schema"
                            : "Select a database first"
                      }
                      disabled={noSchemas || !dbId || schemasLoading}
                    />
                    <ComboboxContent
                      onWheel={(e) => e.stopPropagation()}
                      className="pointer-events-auto"
                    >
                      <ComboboxEmpty>No schemas found.</ComboboxEmpty>
                      <ComboboxList>
                        {(schema) => (
                          <ComboboxItem
                            key={schema.id}
                            value={schema.name}
                            className="flex w-full items-center justify-between pr-1"
                            indicatorClassName="pr-12"
                          >
                            <span className="text-foreground font-medium">{schema.name}</span>
                            <span className="bg-muted text-muted-foreground border-border/50 ml-2 inline-flex w-9 shrink-0 items-center justify-center rounded-md border py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                              v{schema.internal_version}
                            </span>
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                </Field>
              )}
            />
            {/* Framework Selector */}
            <Controller
              control={form.control}
              name="frameworkId"
              render={({ field, fieldState }) => {
                const frameworkItems = frameworks?.results || []

                return (
                  <Field>
                    <FieldLabel>Framework</FieldLabel>
                    <Combobox
                      items={frameworkItems}
                      itemToStringLabel={(framework) => framework?.name ?? ""}
                      value={
                        frameworkItems.find((framework) => framework.id === field.value) ?? null
                      }
                      onValueChange={(framework) => {
                        field.onChange(framework ? framework.id : undefined)
                        if (resolutionError) setResolutionError(null)
                      }}
                    >
                      <ComboboxInput
                        showClear
                        showClearCondition={!!field.value}
                        placeholder={
                          frameworksLoading
                            ? "Loading..."
                            : noFrameworks
                              ? "No frameworks available"
                              : "Select a framework..."
                        }
                        disabled={noFrameworks || frameworksLoading}
                      />
                      <ComboboxContent
                        onWheel={(e) => e.stopPropagation()}
                        className="pointer-events-auto"
                      >
                        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                        <ComboboxList>
                          {(framework) => (
                            <ComboboxItem key={framework.id} value={framework}>
                              {framework.name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                  </Field>
                )
              }}
            />
            {/* Error Feedback Display */}
            {resolutionError && (
              <p className="text-destructive text-sm font-medium">{resolutionError}</p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isWorking || hasNoSelection}>
                {resolvingSchema ? "Loading…" : isMutationPending ? "Starting…" : "Run Check"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
