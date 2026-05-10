import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

type SidebarItem = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
}

type SidebarConfig = {
  title: string
  items: SidebarItem[]
}

export function AppSidebar({ config }: { config: SidebarConfig }) {
  const { pathname } = useLocation()

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="none"
        className={cn(
          // 1. Geometry & Position
          "bg-sidebar/50 w-12 shrink-0 border-r backdrop-blur-sm",
          "sticky top-12 h-full", // Adjust 64px/top-16 to your Navbar height
          "flex flex-col items-center py-4", // Center everything for the rail look
          "transition-none",
        )}
      >
        <SidebarContent className="no-scrollbar w-full overflow-x-hidden overflow-y-auto">
          <SidebarMenu className="flex flex-col items-center gap-2">
            {config.items.map((item) => {
              const isActive = pathname === item.url || pathname === item.url + "/"

              return (
                <SidebarMenuItem key={item.title} className="flex justify-center">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    // 2. These are the "Icon Mode" mimic classes
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md transition-all duration-200",
                      "p-0!", // Remove all default padding to center the icon
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Link to={item.url} className="flex items-center justify-center">
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "size-[1.2rem] transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground/60",
                          )}
                        />
                      )}

                      {/* Keep this for accessibility, but it's invisible */}
                      <span className="sr-only">{item.title}</span>

                      {/* 3. The Active Indicator (Vertical line) */}
                      {isActive && (
                        <div className="bg-primary absolute top-1/4 left-0 h-1/2 w-1 rounded-full" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  )
}
