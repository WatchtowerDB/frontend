import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAllClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  client_db: z.string().min(1, "Please select a database"),
  name: z
    .string()
    .min(1, "Schema name is required")
    .max(100, "Schema name cannot exceed 100 characters"),
  sql_file: z
    .any()
    .refine((files) => files instanceof FileList, "SQL schema file is required.")
    .refine((files) => files?.length === 1, "Exactly one SQL schema file is required."),
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_db: "",
      name: "",
      sql_file: undefined,
    },
  })

  const [clientDb, sqlFile] = useWatch({
    control: form.control,
    name: ["client_db", "sql_file"],
  })

  const dbId = clientDb ? parseInt(clientDb) : null

  const { data: schemas } = useAllClientDBSchemas(dbId ? { client_db: [dbId] } : undefined)
  const uniqueSchemas = Array.from(
    new Map(
      (schemas?.results || [])
        .filter((s) => s?.name && s?.internal_version !== undefined)
        // Sort ascending so higher versions come later and overwrite lower ones
        .sort((a, b) => a.internal_version - b.internal_version)
        .map((s) => [s.name, s]),
    ).values(),
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

  const onSubmit = async (values: z.infer<typeof formSchema>, e?: React.BaseSyntheticEvent) => {
    await onUpload({
      client_db: parseInt(values.client_db),
      name: values.name,
      sql_file: values.sql_file[0],
    })
    if (e?.target) {
      const fileInput = (e.target as HTMLFormElement).querySelector(
        'input[type="file"]',
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }
    form.reset()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Schema</CardTitle>
        <CardDescription>Select a database and upload its SQL schema file.</CardDescription>
      </CardHeader>
      <CardContent>
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
                const search = field.value ?? ""

                const filteredSchemas = (uniqueSchemas ?? []).filter((schema) =>
                  schema.name.toLowerCase().includes(search.toLowerCase()),
                )

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Schema Name</FieldLabel>

                    <Combobox
                      items={uniqueSchemas}
                      value={field.value || ""}
                      onValueChange={(value) => {
                        console.log("Combobox changed:", value)
                        field.onChange(value)
                      }}
                    >
                      <ComboboxInput
                        disabled={!dbId}
                        placeholder={
                          dbId ? "Type a new name or select existing..." : "Select a database first"
                        }
                        value={field.value ?? ""}
                        onChange={(value) => {
                          console.log("Combobox changed:", value)
                          field.onChange(value)
                        }}
                      />

                      <ComboboxContent>
                        <ComboboxList>
                          {filteredSchemas.map((schema) => (
                            <ComboboxItem key={schema.id} value={schema.name}>
                              <span className="text-foreground font-medium">{schema.name}</span>
                              <span className="bg-muted text-muted-foreground border-border/50 ml-2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                                v{schema.internal_version}
                              </span>
                            </ComboboxItem>
                          ))}
                          {/* { (
                            <ComboboxEmpty onClick={()=>console.log("hello")}>Create "{search}"</ComboboxEmpty>
                          )} */}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )
              }}
            />
            {/* Schema file input */}
            <Controller
              name="sql_file"
              control={form.control}
              render={({ field: { value: _v, onChange, ref, ...props }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>SQL Schema File</FieldLabel>
                  <Input
                    {...props}
                    type="file"
                    accept=".sql"
                    ref={ref}
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
