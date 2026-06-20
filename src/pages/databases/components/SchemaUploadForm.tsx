import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Link } from "react-router-dom"
import * as z from "zod"

const formSchema = z.object({
  client_db: z.string().min(1, "Please select a database"),
  name: z
    .string()
    .min(1, "Schema name is required")
    .max(100, "Schema name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .nullable()
    .or(z.string())
    .transform((val) => (val && val.trim() !== "" ? val : null)),
  sql_file: z
    .any()
    .refine((files) => files instanceof FileList, "SQL schema file is required.")
    .refine((files) => files?.length === 1, "Exactly one SQL schema file is required."),
})

interface SchemaUploadFormProps {
  databases: { id: number; name: string }[]
  schemasLoading: boolean
  isUploading: boolean
  onUpload: (data: {
    client_db: number
    name: string
    description: string | null
    sql_file: File
  }) => Promise<unknown>
  onPreviewChange: (content: string | null) => void
}

export function SchemaUploadForm({
  databases,
  schemasLoading,
  isUploading,
  onUpload,
  onPreviewChange,
}: SchemaUploadFormProps) {
  const [openSchema, setOpenSchema] = useState(false)
  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      client_db: "",
      name: "",
      description: "",
      sql_file: undefined,
    },
  })

  const [clientDb, sqlFile, schemaName] = useWatch({
    control: form.control,
    name: ["client_db", "sql_file", "name"],
  })

  const dbId = clientDb ? parseInt(clientDb) : null

  const noSelection = !dbId || !schemaName?.trim() || !sqlFile || sqlFile.length === 0

  const { data: schemas } = useAllClientDBSchemas(dbId ? { client_db: [dbId] } : undefined)
  const uniqueSchemas = Array.from(
    new Map(
      (schemas?.results || [])
        .filter((s) => s?.name && s?.internal_version !== undefined)
        .sort((a, b) => a.internal_version - b.internal_version)
        .map((s) => [s.name, s]),
    ).values(),
  )

  // The following is purely so there's no 0.2 seconds delay when the user clears the form for Schema Name.
  // Yeah. A whole useEffect and quarters.
  const [cachedItems, setCachedItems] = useState(uniqueSchemas)
  const search = (schemaName ?? "").trim().toLowerCase()
  const activeFilteredSchemas = uniqueSchemas.filter((schema) =>
    schema.name.toLowerCase().includes(search),
  )

  useEffect(() => {
    if (sqlFile && sqlFile.length > 0) {
      const reader = new FileReader()
      reader.onload = (e) => onPreviewChange(e.target?.result as string)
      reader.readAsText(sqlFile[0])
    } else {
      onPreviewChange(null)
    }
  }, [sqlFile, onPreviewChange])

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      await onUpload({
        client_db: parseInt(values.client_db, 10),
        name: values.name,
        description: values.description,
        sql_file: values.sql_file[0],
      })

      form.reset()
    },
    [onUpload, form],
  )
  return (
    <form
      id="schema-upload-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full space-y-6"
    >
      <FieldGroup>
        {/* Client database selector */}
        <Controller
          name="client_db"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Client Database</FieldLabel>
              <Select
                disabled={databases.length === 0}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      databases.length === 0 ? "No databases available" : "Select a database"
                    }
                  />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" sideOffset={4}>
                  {databases.map((db) => (
                    <SelectItem key={db.id} value={db.id.toString()}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {databases.length === 0 && (
                <p className="text-destructive mt-1 text-sm">
                  No databases available. Please add one on the{" "}
                  <Link to="/databases/clientdbs" className="hover:text-destructive/80 underline">
                    databases page
                  </Link>
                  .
                </p>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Schema name combobox */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => {
            const displayItems = openSchema ? activeFilteredSchemas : cachedItems
            // Note that the same behavior isn't shared with the run compliance check dialog.
            // Where changing the database name invalidates the schema name selected.
            // That is precisely because the user can use the same name as a new one in another.

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Schema Name</FieldLabel>
                <Combobox
                  open={openSchema}
                  onOpenChange={(open) => {
                    if (open) setCachedItems(activeFilteredSchemas)
                    setOpenSchema(open)
                  }}
                  items={displayItems}
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value ?? "")
                    setOpenSchema(false)
                  }}
                >
                  <ComboboxInput
                    showClear
                    showClearCondition={!!field.value}
                    disabled={!dbId || schemasLoading}
                    onClear={() => {
                      setCachedItems(activeFilteredSchemas)
                      field.onChange("")
                      setOpenSchema(false)
                    }}
                    placeholder={
                      schemasLoading
                        ? "Loading..."
                        : dbId
                          ? "Type a new name or select existing..."
                          : "Select a database first"
                    }
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const strValue = e.target.value ?? ""

                      field.onChange(strValue)
                      if (dbId) {
                        setCachedItems(
                          uniqueSchemas.filter((s) =>
                            s.name.toLowerCase().includes(strValue.trim().toLowerCase()),
                          ),
                        )
                        if (!openSchema) setOpenSchema(true)
                      }
                    }}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {displayItems.map((schema) => (
                        <ComboboxItem key={schema.id} value={schema.name}>
                          <span className="text-foreground font-medium">{schema.name}</span>
                          <span className="bg-muted text-muted-foreground border-border/50 ml-2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                            v{schema.internal_version}
                          </span>
                        </ComboboxItem>
                      ))}

                      {/* Case 1: The input is empty, and there's nothing to show.*/}
                      {activeFilteredSchemas.length === 0 && !field.value?.trim() && (
                        <ComboboxEmpty className="text-muted-foreground cursor-default px-2 py-1.5 text-sm select-none">
                          No schemas found.
                        </ComboboxEmpty>
                      )}

                      {/* Case 2: The user has typed a new name. */}
                      {activeFilteredSchemas.length === 0 && field.value?.trim() && (
                        <ComboboxEmpty
                          className="hover:bg-accent hover:text-accent-foreground cursor-pointer px-2 py-1.5 text-sm outline-hidden select-none"
                          role="button"
                          onClick={() => {
                            const trimmedValue = field.value.trim()
                            field.onChange(trimmedValue)
                            setOpenSchema(false)
                          }}
                        >
                          New schema "{field.value.trim()}"
                        </ComboboxEmpty>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )
          }}
        />

        {/* Description Textarea (optional) */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Description <span className="text-muted-foreground">(Optional)</span>
              </FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="Enter schema description..."
                rows={4}
                className="max-h-35 resize-none overflow-y-auto"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Schema file input */}
        <Controller
          name="sql_file"
          control={form.control}
          render={({ field: { value: _v, onChange, ref }, fieldState }) => {
            const fileName = _v?.[0]?.name

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>SQL Schema File</FieldLabel>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="sql-file-input"
                    className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium shadow-xs transition-colors"
                  >
                    Choose file
                  </label>
                  <span className="text-muted-foreground truncate text-sm">
                    {fileName ?? "No file selected"}
                  </span>
                </div>
                <input
                  id="sql-file-input"
                  type="file"
                  accept=".sql"
                  className="hidden"
                  ref={ref} // Handed over entirely to React Hook Form; no custom manipulation!
                  // NO REFS METHOD 2: When key changes on reset, the input automatically clears itself completely!
                  key={_v ? "file-loaded" : "file-empty"}
                  onChange={(e) => onChange(e.target.files)}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      {/* Submit button */}
      <div className="flex pt-2">
        <Button type="submit" disabled={isUploading || noSelection} className="w-full">
          {isUploading ? "Uploading..." : "Upload Schema"}
        </Button>
      </div>
    </form>
  )
}
