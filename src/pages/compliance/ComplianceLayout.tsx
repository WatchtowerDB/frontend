// src/pages/compliance/ComplianceLayout.tsx
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar"; // Your generic component
import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, List } from "lucide-react";

const COMPLIANCE_NAV = {
  title: "Compliance",
  items: [
    {
      title: "Summary",
      url: "/compliance",
      icon: LayoutDashboard, // Gives it that "Command Center" feel
    },
    {
      title: "Queries",
      url: "/compliance/queries",
      icon: List, // Perfect for auditing and database searches
    },
  ],
};

export default function ComplianceLayout() {
  const { pathname } = useLocation();

  const currentItem = COMPLIANCE_NAV.items.find(
    (item) => item.url === pathname,
  );

  return (
    <SidebarProvider>
      <AppSidebar config={COMPLIANCE_NAV} />
      {/* The sidebar */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          {currentItem?.title || "Compliance Control"}
        </header>

        {/* The actual page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
