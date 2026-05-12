import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAssertions } from "@/hooks/useAssertions"
import { InfoIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface AssertionReportProps {
  assertionId: number | null
  title?: string
}

export default function AssertionReport({
  assertionId,
  title = "Assertion Details",
}: AssertionReportProps) {
  const fake: string = `
### VIOLATION SUMMARY
The compliance assertion has failed, indicating a **PCI-DSS v4.0.1** violation. Specifically, the assertion:
\`SELECT card_number FROM operations.cardholder_data WHERE card_number IS NOT NULL AND card_number_masked IS NOT NULL AND card_number != card_number_masked;\` 
returns rows where the card number is not the same as its masked version, which suggests that the card numbers are not properly masked.

### STANDARD REFERENCE
The violation pertains to PCI-DSS v4.0.1 clauses:
- **4.1 Data Security:** The card numbers are being stored in a non-masked format.
- **4.2 Access Control:** The access to sensitive data is not appropriately controlled.

### SECURITY IMPACT
This violation poses a significant risk. If card numbers are not properly masked, they could be exposed to unauthorized individuals, leading to potential data breaches and identity theft.

### REMEDIATION STEPS

1. **Identify and Mask Card Numbers**
Ensure all card numbers in \`operations.cardholder_data\` are properly masked.

\`\`\`sql
UPDATE operations.cardholder_data
SET card_number_masked = CONCAT('XXXX-XXXX-XXXX-', SUBSTRING(card_number, -4))
WHERE card_number IS NOT NULL;
\`\`\`

2. **Remove Unmasked Data**
\`\`\`sql
DELETE FROM operations.cardholder_data
WHERE card_number IS NOT NULL AND card_number_masked IS NULL;
\`\`\`

3. **Implement Encryption**
If card numbers must be stored in a non-masked format, encrypt them at rest (e.g., AES-256).

\`\`\`python
from cryptography.fernet import Fernet

# Encrypt card numbers example
key = Fernet.generate_key()
cipher_suite = Fernet(key)
# ... logic to encrypt ...
\`\`\`
`
  const { data } = useAssertions()
  const assertion = data?.results.find((a) => a.id === assertionId)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-none border-b px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <SidebarTrigger />
          {title}
          {assertion ? (
            <Badge variant={assertion.result ? "outline" : "destructive"} className="ml-2">
              {assertion.result ? "Pass" : "Fail"}
            </Badge>
          ) : null}
        </h2>
      </div>

      {/* Scrollable body + sticky footer overlay */}
      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full w-full">
          {assertion ? (
            <div className="p-6 pb-20">
              <div className="relative mb-6">
                <span className="absolute inset-s-3 top-2 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                  SQL
                </span>
                <pre className="overflow-x-auto rounded-md border-2 bg-slate-950 p-4 pt-7 text-sm break-all whitespace-pre-wrap text-slate-50 shadow-lg">
                  <code>{assertion.sql_query}</code>
                </pre>
              </div>
              <article className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-pre:bg-slate-950 prose-pre:text-slate-50 prose-pre:shadow-lg prose-pre:border-2 max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{fake}</ReactMarkdown>
              </article>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-20 text-slate-400 italic">
              <InfoIcon className="mb-2 h-8 w-8 opacity-20" />
              <p>Select an assertion to view its audit intelligence.</p>
            </div>
          )}
        </ScrollArea>

        {/* Alert overlays the bottom of the scroll area */}
        <div className="absolute inset-x-0 bottom-0 border-t bg-white px-6 transition-colors duration-200 dark:bg-slate-950">
          <Alert className="rounded-none border-none bg-transparent p-0 py-3">
            <AlertDescription className="text-muted-foreground text-center text-[10px] leading-relaxed tracking-widest uppercase">
              All responses are AI-generated and may not always be accurate or complete. They should
              be independently reviewed and verified by a domain expert. WatchtowerDB is NOT
              responsible for any actions taken based on these responses.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
