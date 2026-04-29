import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GenericSidebarProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function GenericSidebar({
  children,
  title,
  subtitle = "DB DATABASE",
  className,
}: GenericSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        // We keep it static/h-full as per your setup, but allow custom overrides
        className={cn(
          "static! h-full! border-r bg-sidebar/50 backdrop-blur-sm",
          className,
        )}
      >
        {/* Header only renders if a title is provided */}
        {title && (
          <SidebarHeader className="h-13 mt-1 flex px-4 overflow-hidden transition-all duration-200 group-data-[state=collapsed]:h-0 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:border-none">
            <div className="flex flex-col items-start transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
              <h2 className="font-bold tracking-tight whitespace-nowrap">
                {title}
              </h2>
              <span className="text-xs font-medium text-on-surface-variant/60 uppercase tracking-widest">
                {subtitle}
              </span>
            </div>
          </SidebarHeader>
        )}

        <SidebarContent className="overflow-x-hidden">
          {/* This is where your custom components or menus will live */}
          {children}
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
