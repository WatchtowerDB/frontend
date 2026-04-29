import React from "react";
import AssertionsList from "./components/AssertionsList";
import { GenericSidebar } from "@/components/GenericSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

function AssertionsPage() {
  return (
    <div className="flex h-full w-full">
      <GenericSidebar
        children=<AssertionsList />
        className={
          "group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:border-0 w-[30vw]"
        }
      />
      <SidebarInset>
        {/* The actual page content */}
        <main className="p-6">
          <h2>here I render the stuffies</h2>
        </main>
      </SidebarInset>
    </div>
  );
}

export default AssertionsPage;
