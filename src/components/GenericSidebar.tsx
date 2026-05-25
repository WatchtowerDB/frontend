import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type React from "react"
import { ScrollArea } from "./ui/scroll-area"

interface GenericSidebarProps {
  children: React.ReactNode
  headerChildren?: React.ReactNode
  footerChildren?: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function GenericSidebar({
  children,
  headerChildren,
  footerChildren,
  title,
  subtitle = "DB DATABASE",
  className,
}: GenericSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="offcanvas"
        variant="sidebar"
        className={cn("bg-sidebar/50 static! h-full! border-r backdrop-blur-sm", className)}
      >
        {/* Header only renders if a title is provided */}
        {title && (
          <SidebarHeader className="mt-1 flex h-13 overflow-hidden px-4 transition-all duration-200 group-data-[state=collapsed]:h-0 group-data-[state=collapsed]:border-none group-data-[state=collapsed]:p-0">
            <div className="flex flex-col items-start transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
              <h2 className="font-bold tracking-tight whitespace-nowrap">{title}</h2>
              <span className="text-on-surface-variant/60 text-xs font-medium tracking-widest uppercase">
                {subtitle}
              </span>
            </div>
          </SidebarHeader>
        )}
        {/* Header children, also optional. Likely will have search, filter, etc. */}
        {headerChildren && (
          <SidebarHeader className="mx-1 mt-1 flex min-h-16 min-w-0 overflow-hidden border-b px-4 transition-all duration-200 group-data-[state=collapsed]:h-0 group-data-[state=collapsed]:border-none group-data-[state=collapsed]:p-0">
            {headerChildren}
          </SidebarHeader>
        )}

        <SidebarContent className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="flex w-full min-w-0 flex-col">{children}</div>
          </ScrollArea>
        </SidebarContent>
        {footerChildren && (
          <SidebarFooter className="mx-1 border-t p-0"> {footerChildren}</SidebarFooter>
        )}
      </Sidebar>
    </TooltipProvider>
  )
}
