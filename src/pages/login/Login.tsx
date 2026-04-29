import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "./components/LoginForm"
import Logo from "@/components/Logo"

export default function Login() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-12 items-center justify-center rounded-md text-primary-foreground">
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
