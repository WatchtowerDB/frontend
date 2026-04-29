import { Book, Database, HelpCircle, Home, Settings, Shield } from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
}

export const APP_NAV: NavItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Compliance", url: "/compliance", icon: Shield },
  { title: "Databases", url: "/databases", icon: Database },
  { title: "Standards", url: "/standards", icon: Book },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
]
