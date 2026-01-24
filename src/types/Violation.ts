// type Violation = {
//     query: string;
//     violation: string;
//     pci_dss_reference: string;
//     remediation: string;
// }

type AssertionItem = {
    id: number;
    sql_query: string;
    result: boolean;
    recommendation: string;
    compliance_framework: number;
    client_db: number;
    schema: number;
}


type AssertionsResponse = {
    count: number;
    next: number | null;
    previous: number | null;
    results: AssertionItem[];
}