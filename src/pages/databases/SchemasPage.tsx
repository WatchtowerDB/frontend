import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Loader from "@/components/ui/loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  client_db: z.string().min(1, "Please select a database"),
  sql_file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "SQL schema file is required."),
})

export default function SchemasPage() {
  const { databases, isLoading, isUploading, uploadSchema } = useClientDBSchemas() // NOT IMPLEMENTED PROPERLY I THINK

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_db: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const file = values.sql_file[0]
    await uploadSchema({
      client_db: parseInt(values.client_db),
      sql_file: file,
    })
    form.reset()
  }

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
        <h1 className="text-2xl font-bold">Database Schemas</h1>
        <p className="text-foreground">Upload a new schema for a selected database</p>
      </header>
      <main className="flex h-full min-h-0 w-full flex-col pt-4">
        <Card className="w-full max-w-2xl">
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
                      <FieldLabel htmlFor="client-db-select">Client Database</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="client-db-select" aria-invalid={fieldState.invalid}>
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
                      <FieldDescription>
                        Select the database you want to upload the schema for.
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="sql_file"
                  control={form.control}
                  render={({ field: { value: _value, onChange, ...fieldProps }, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sql-file-input">SQL Schema File</FieldLabel>
                      <Input
                        {...fieldProps}
                        id="sql-file-input"
                        type="file"
                        accept=".sql"
                        aria-invalid={fieldState.invalid}
                        onChange={(event) => onChange(event.target.files)}
                      />
                      <FieldDescription>
                        Upload a .sql file containing the database schema definition.
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isUploading}
              >
                Reset
              </Button>
              <Button type="submit" form="schema-upload-form" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Schema"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
