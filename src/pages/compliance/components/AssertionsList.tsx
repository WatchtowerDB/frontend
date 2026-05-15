import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAssertions } from "@/hooks/useAssertions"

interface AssertionListProps {
  onSelect?: (item: number) => void
  selectedId?: number | null
}

const AssertionsList = ({ onSelect, selectedId }: AssertionListProps) => {
  const { assertions, isLoading, isError, error, isFetching } = useAssertions()

  if (isLoading) return <div className="animate-pulse p-4 text-xs">Scanning assertions...</div>
  if (isError)
    return <div className="text-destructive p-4 text-xs">Failed to load: {error.message}</div>

  const mockAssertions = {
    results: [
      {
        id: 1,
        sql_query:
          "SELECT card_number FROM operations.cardholder_data WHERE card_number IS NOT NULL AND card_number != card_number_masked;",
        result: false,
        compliance_check: "PCI-DSS v4.0.1 § 4.1 – Card number masking",
        recommendation: "## VIOLATION SUMMARY\nCard numbers are stored unmasked...",
      },
      {
        id: 2,
        sql_query:
          "SELECT 1 FROM operations.audit_log WHERE last_reviewed < NOW() - INTERVAL '90 days';",
        result: false,
        compliance_check: "PCI-DSS v4.0.1 § 10.7 – Audit log review frequency",
        recommendation: "",
      },
      {
        id: 3,
        sql_query:
          "SELECT 1 FROM operations.cardholder_data WHERE encryption_status = 'encrypted';",
        result: true,
        compliance_check: "PCI-DSS v4.0.1 § 3.5 – Data encryption at rest",
        recommendation: "",
      },
      {
        id: 4,
        sql_query:
          "SELECT 1 FROM access_control.user_roles WHERE role = 'admin' AND mfa_enabled = true;",
        result: true,
        compliance_check: "PCI-DSS v4.0.1 § 8.4 – MFA for administrative access",
        recommendation: "",
      },
      {
        id: 5,
        sql_query:
          "SELECT 1 FROM network.firewall_rules WHERE rule_reviewed_at < NOW() - INTERVAL '1 year';",
        result: false,
        compliance_check: "PCI-DSS v4.0.1 § 1.2 – Firewall rule review",
        recommendation: "",
      },
    ],
  }

  return (
    <div className="relative flex flex-col">
      {isFetching && <div className="text-muted-foreground px-4 py-1 text-[10px]">Updating…</div>}

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu
            className={`gap-1 transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {assertions.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={selectedId === item.id}
                  className="h-auto flex-col items-start gap-1 border-b p-0 last:border-b-0"
                >
                  <button
                    onClick={() => onSelect?.(item.id)}
                    className={`flex w-full flex-col items-start gap-1 p-4 backdrop-blur-sm ${
                      item.result
                        ? "border-l-4 border-emerald-500 bg-linear-to-br from-emerald-500/15 via-emerald-500/5 via-10% to-transparent to-15%"
                        : "border-l-4 border-red-500 bg-linear-to-br from-red-500/15 via-red-500/5 via-10% to-transparent to-15%"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="truncate text-left font-mono text-xs">
                        {item.id} • {item.sql_query}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-left text-[10px]">
                      {item.compliance_check}
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}

export default AssertionsList
