import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Database, Table2 } from "lucide-react"
import { Outlet } from "react-router-dom"

const DATABASES_NAV = {
  title: "Databases",
  items: [
    {
      title: "Client DBs",
      url: "/databases/clientdbs",
      icon: Database,
    },
    {
      title: "Schemas",
      url: "/databases/schemas",
      icon: Table2,
    },
  ],
}

export default function DatabasesLayout() {
  return (
    <SidebarProvider defaultOpen={true} className="h-full min-h-0 flex-1">
      <AppSidebar config={DATABASES_NAV} />
      <main className="h-full">
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
