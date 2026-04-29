import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, List } from "lucide-react";
import { GenericSidebar } from "@/components/GenericSidebar";
import AssertionsList from "./components/AssertionsList";

const COMPLIANCE_NAV = {
  title: "Compliance",
  items: [
    {
      title: "Summary",
      url: "/compliance",
      icon: LayoutDashboard,
    },
    {
      title: "Assertions",
      url: "/compliance/assertions",
      icon: List,
    },
  ],
};

export default function ComplianceLayout() {
  const { pathname } = useLocation();

  const currentItem = COMPLIANCE_NAV.items.find(
    (item) => item.url === pathname,
  );

  return (
    <SidebarProvider defaultOpen={false} className="min-h-0 flex-1">
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
