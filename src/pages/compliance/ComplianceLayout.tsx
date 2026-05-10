import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { LayoutDashboard, List } from "lucide-react"
import { Outlet } from "react-router-dom"

const COMPLIANCE_NAV = {
  title: "Compliance",
  items: [
    {
      title: "Summary",
      url: "/compliance/summary",
      icon: LayoutDashboard,
    },
    {
      title: "Assertions",
      url: "/compliance/assertions",
      icon: List,
    },
  ],
}

export default function ComplianceLayout() {
  return (
    <SidebarProvider defaultOpen={true} className="h-full min-h-0 flex-1">
      <AppSidebar config={COMPLIANCE_NAV} />
      {/* The sidebar */}
      <SidebarInset className="min-h-0 overflow-hidden">
        <main className="h-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
