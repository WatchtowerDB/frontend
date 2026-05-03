import { useAuthStore } from "@/stores/useAuthStore"
import { LogOut } from "lucide-react"
import { Button } from "../ui/button"

export function Logout() {
  const { logout } = useAuthStore()
  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={logout}>
      <LogOut className="size-4" />
      Logout
    </Button>
  )
}
