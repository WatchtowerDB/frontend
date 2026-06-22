import Logo from "@/components/Logo"
import ThemeToggle from "@/components/ThemeToggle"
import { MeshGradientBackground } from "@/components/ui/mesh-gradient-background"
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
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <MeshGradientBackground
        className="-z-50"
        colors={["var(--mesh-1)", "var(--mesh-1)", "var(--mesh-2)", "var(--mesh-2)"]}
        speed={1.75}
        backgroundColor="var(--mesh-bg)"
      />
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <ThemeToggle />
      </div>
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
