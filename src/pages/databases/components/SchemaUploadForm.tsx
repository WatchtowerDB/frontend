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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  client_db: z.string().min(1, "Please select a database"),
  sql_file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "SQL schema file is required."),
})

interface SchemaUploadFormProps {
  databases: { id: number; name: string }[]
  isUploading: boolean
  onUpload: (data: { client_db: number; sql_file: File }) => Promise<unknown>
  onPreviewChange: (content: string | null) => void
}

export function SchemaUploadForm({
  databases,
  isUploading,
  onUpload,
  onPreviewChange,
}: SchemaUploadFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { client_db: "" },
  })

  const sqlFile = useWatch({
    control: form.control,
    name: "sql_file",
  })

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
        <form id="schema-upload-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
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
