import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  client_db: z.string().min(1, "Please select a database"),
  name: z
    .string()
    .min(1, "Schema name is required")
    .max(100, "Schema name cannot exceed 100 characters"),
  sql_file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "SQL schema file is required."),
})

interface SchemaUploadFormProps {
  databases: { id: number; name: string }[]
  isUploading: boolean
  onUpload: (data: { client_db: number; name: string; sql_file: File }) => Promise<unknown>
  onPreviewChange: (content: string | null) => void
}

// TODO: add description.
export function SchemaUploadForm({
  databases,
  isUploading,
  onUpload,
  onPreviewChange,
}: SchemaUploadFormProps) {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_db: "",
      name: "",
    },
  })

  const [clientDb, sqlFile] = useWatch({
    control: form.control,
    name: ["client_db", "sql_file"],
  })

  const dbId = clientDb ? parseInt(clientDb) : null

  const { data: schemas } = useAllClientDBSchemas(dbId ? { client_db: [dbId] } : undefined)

  useEffect(() => {
    if (sqlFile && sqlFile.length > 0) {
      const reader = new FileReader()
      reader.onload = (e) => onPreviewChange(e.target?.result as string)
      reader.readAsText(sqlFile[0])
    } else {
      onPreviewChange(null)
    }
  }, [sqlFile, onPreviewChange])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await onUpload({
      client_db: parseInt(values.client_db),
      name: values.name,
      sql_file: values.sql_file[0],
    })
    form.reset()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Schema</CardTitle>
        <CardDescription>Select a database and upload its SQL schema file.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => console.log("Billie jean", schemas)}>
          <img src="/mambo/mambo.gif" className="h-6 w-6" />
        </Button>
        <form id="schema-upload-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Client database selector */}
            <Controller
              name="client_db"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Client Database</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a database" />
                    </SelectTrigger>
                    <SelectContent>
                      {databases.map((db) => (
                        <SelectItem key={db.id} value={db.id.toString()}>
                          {db.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {/* Schema name combobox */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                const filteredSchemas = (schemas?.results || []).filter((s) =>
                  s.name.toLowerCase().includes((field.value || "").toLowerCase()),
                )
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Schema Name</FieldLabel>
                    <div className="relative">
                      <Popover open={open && filteredSchemas.length > 0} onOpenChange={setOpen}>
                        <PopoverAnchor asChild>
                          <Input
                            {...field}
                            type="text"
                            disabled={!dbId}
                            onFocus={() => setOpen(true)}
                            autoComplete="off"
                            placeholder={
                              dbId
                                ? "Type a new name or select existing..."
                                : "Select a database first"
                            }
                            maxLength={100}
                            className="w-full"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </PopoverAnchor>

                        <PopoverContent
                          className="bg-popover max-h-60 w-(--radix-popover-trigger-width) overflow-y-auto rounded-md border p-1 shadow-md"
                          onOpenAutoFocus={(e) => e.preventDefault()}
                          onInteractOutside={(e) => {
                            // Prevent Radix from closing the popover
                            if (e.target instanceof Element && e.target.closest("input")) {
                              e.preventDefault()
                            }
                          }}
                        >
                          {(schemas?.results || [])
                            .filter((schema) =>
                              schema.name.toLowerCase().includes((field.value || "").toLowerCase()),
                            )
                            .map((schema) => (
                              <button
                                key={schema.id}
                                type="button"
                                className="hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center justify-between rounded-sm px-2.5 py-2 text-left text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => {
                                  field.onChange(schema.name)
                                  setOpen(false)
                                }}
                              >
                                <span className="text-foreground font-medium">{schema.name}</span>
                                <span className="bg-muted text-muted-foreground border-border/50 ml-2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                                  v{schema.internal_version}
                                </span>
                              </button>
                            ))}
                        </PopoverContent>
                      </Popover>
                    </div>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )
              }}
            />
            {/* Schema file input */}
            <Controller
              name="sql_file"
              control={form.control}
              render={({ field: { value: _v, onChange, ...props }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>SQL Schema File</FieldLabel>
                  <Input
                    {...props}
                    type="file"
                    accept=".sql"
                    onChange={(e) => onChange(e.target.files)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="schema-upload-form" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Schema"}
        </Button>
      </CardFooter>
    </Card>
  )
}
