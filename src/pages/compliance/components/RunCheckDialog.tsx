import { getClientDBSchemas } from "@/api/clientdbschema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRunComplianceCheck } from "@/hooks/useChecks"
import { useAllClientDBs } from "@/hooks/useClientDBs"
import { useFrameworks } from "@/hooks/useFrameworks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const schema = z.object({
  frameworkId: z.number({ message: "Select a framework" }),
  clientDbId: z.number({ message: "Select a client database" }),
})

type RunCheckForm = z.infer<typeof schema>

interface RunCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RunCheckDialog({ open, onOpenChange }: RunCheckDialogProps) {
  const queryClient = useQueryClient()
  const [resolvingSchema, setResolvingSchema] = useState(false)
  const [resolutionError, setResolutionError] = useState<string | null>(null)

  // Fetching frameworks and clientDbs to populate the dropdowns.
  const { data: frameworks } = useFrameworks()
  const { data: clientDbs } = useAllClientDBs()

  const { mutate, isPending: isMutationPending } = useRunComplianceCheck()

  const form = useForm<RunCheckForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      frameworkId: undefined,
      clientDbId: undefined,
    },
  })

  // To disable submission if nothing is selected.
  const watchedFrameworkId = form.watch("frameworkId")
  const watchedClientDbId = form.watch("clientDbId")
  const hasNoSelection = !watchedFrameworkId || !watchedClientDbId

  const onSubmit = async (values: RunCheckForm) => {
    setResolvingSchema(true)
    setResolutionError(null)

    try {
      const rawSchemasData = await queryClient.fetchQuery({
        queryKey: ["clientDbSchemas", "list", { client_db: values.clientDbId }],
        queryFn: () => getClientDBSchemas({ client_db: values.clientDbId }),
        staleTime: 1000 * 60 * 30,
      })
      const schemasArray = rawSchemasData?.results

      if (!schemasArray || schemasArray.length === 0) {
        setResolutionError("This Client Database has no schemas associated with it.")
        setResolvingSchema(false)
        return
      }

      const sorted = [...schemasArray].sort((a, b) => {
        const timeA = new Date(a.created_at).getTime()
        const timeB = new Date(b.created_at).getTime()

        if (timeB !== timeA) return timeB - timeA
        return b.id - a.id
      })

      const winningSchemaId = sorted[0].id

      mutate(
        { frameworkId: values.frameworkId, schemaId: winningSchemaId },
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
  const noFrameworks = !frameworks?.results || frameworks.results.length === 0
  const noDatabases = !clientDbs?.results || clientDbs.results.length === 0

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
            {/* Framework Selector */}
            <Controller
              control={form.control}
              name="frameworkId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Framework</FieldLabel>
                  <Select
                    disabled={noFrameworks}
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => {
                      field.onChange(Number(v))
                      if (resolutionError) setResolutionError(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          noFrameworks ? "No frameworks available" : "Select a framework"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks?.results?.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                </Field>
              )}
            />

            {/* Client Database Selector */}
            <Controller
              control={form.control}
              name="clientDbId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Client Database</FieldLabel>
                  <Select
                    disabled={noDatabases}
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => {
                      field.onChange(Number(v))
                      if (resolutionError) setResolutionError(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={noDatabases ? "No databases available" : "Select a database"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {clientDbs?.results?.map((db) => (
                        <SelectItem key={db.id} value={String(db.id)}>
                          {db.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                </Field>
              )}
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
