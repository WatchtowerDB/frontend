import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/useAuthStore"
import type { APIError } from "@/types/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const login = useAuthStore((state) => state.login)

  const loginSchema = z.object({
    username: z.string().min(3, { message: "Username is too short, you weakling!" }),
    password: z.string().min(3, { message: "Password must be at least 3 characters." }),
    // Probably not 3 letters lol.
  })

  type LoginFormValues = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data)
    } catch (error) {
      const apiError = error as APIError
      if (apiError.status === 401) {
        setError("username", { type: "manual", message: "Invalid credentials" })
        setError("password", { type: "manual", message: "Invalid credentials" })
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username" className={errors.password ? "text-red-600" : ""}>
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="username"
                  //   placeholder="m@example.com"
                  {...register("username")}
                  className={errors.username ? "border-destructive" : ""}
                  required
                />
                {errors.username && (
                  <FieldError
                    className="text-destructive -mt-1 text-xs"
                    errors={[{ message: errors.username.message }]}
                  />
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className={errors.password ? "text-red-600" : ""}>
                    Password
                  </FieldLabel>
                  {/* <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                  required
                />
                {errors.password && (
                  <FieldError
                    className="text-destructive -mt-1 text-xs"
                    errors={[{ message: errors.password.message }]}
                  />
                )}
              </Field>
              <Field>
                <Button type="submit" className="mb-5" disabled={isSubmitting}>
                  {isSubmitting ? "Please wait..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
