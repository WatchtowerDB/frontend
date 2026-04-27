import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Outlet } from "react-router-dom"

export function SidebarLayout() {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        {/* We use the Outlet to render both the Sidebar AND the Content */}
        <Outlet />
      </div>
    </SidebarProvider>
  )
}