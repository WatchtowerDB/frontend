import Logo from "@/components/Logo"
import { useAuthStore } from "@/stores/useAuthStore"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LoginForm } from "./components/LoginForm"

export default function Login() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="text-primary-foreground flex size-12 items-center justify-center rounded-md">
            {/* <GalleryVerticalEnd className="size-4" /> */}
            <Logo />
          </div>
          WatchtowerDB
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
