import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useFrameworks } from "@/hooks/useFrameworks"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, Form, useForm } from "react-hook-form"
import * as z from "zod"

const schema = z.object({
  frameworkId: z.number({ message: "Select a framework" }),
  schemaId: z.number({ message: "Select a database" }),
})

type RunCheckForm = z.infer<typeof schema>

export default function RunCheckDialog() {
  const { data: frameworks } = useFrameworks()
  const { mutate, isPending } = useRunComplianceCheck()
  const form = useForm<RunCheckForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (values: RunCheckForm) => {
    mutate({ frameworkId: values.frameworkId, schemaId: values.schemaId })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Run Compliance Check</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run Compliance Check</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Controller
              control={form.control}
              name="frameworkId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Framework</FieldLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks?.results.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="schemaId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Framework</FieldLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks?.results.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError />
                </Field>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Starting…" : "Run Check"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
