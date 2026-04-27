import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { APP_NAV } from "@/config/app-nav";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

type SidebarItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type SidebarConfig = {
  title: string;
  items: SidebarItem[];
};

export function AppSidebar({ config }: { config: SidebarConfig }) {
  const { pathname } = useLocation();
  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        // Using !static and !h-full to keep it in the flow below your Navbar
        className="static! h-full! border-r bg-sidebar/50 backdrop-blur-sm"
        collapsible="icon"
        variant="sidebar"
      >
        <SidebarHeader className="h-13 mt-1 flex px-4 overflow-hidden transition-all duration-200 group-data-[state=collapsed]:h-0 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:border-none">
          <div className="flex flex-col items-start transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
            {/* <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xs font-black">W</span>
            </div> */}
            <h2 className="font-bold tracking-tight whitespace-nowrap start-auto">
              {config?.title}
            </h2>
            <span className="text-xs font-medium text-on-surface-variant/60 uppercase tracking-widest">DB DATABASE</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {config.items.map((item: any) => {
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "relative h-15 transition-all duration-200 hover:bg-sidebar-accent",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          {item.icon && (
                            <item.icon
                              className={cn(
                                "size-4.5 transition-colors",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground/60",
                              )}
                            />
                          )}
                          <span className="transition-opacity group-data-[collapsible=icon]:opacity-0">
                            {item.title}
                          </span>

                          {/* Active Indicator (vertical line) */}
                          {isActive && (
                            <div className="absolute left-0 top-1/4 h-1/2 w-1 rounded-full bg-primary" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
