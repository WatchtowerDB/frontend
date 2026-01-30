import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import ResponsiveDialogue from "@/components/ResponsiveDialog";
import { DialogAction } from "@/types/DialogAction";
import { useSchemaStore } from "../store/schemaStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ViewAssertionDialogProps = {
  open: boolean;
  onClose: () => void;
  assertionData: string | undefined;
};

export default function ViewAssertionDialog({
  open,
  onClose,
  assertionData,
}: ViewAssertionDialogProps) {
  // const schemas = useSchemaStore((state) => state.schemas);
  // const selectedSchema = useSchemaStore((state) => state.selectedSchema);
  // const schemaObj = schemas.find((s) => s.id === selectedSchema);
  // const [json, setJson] = useState<string | undefined>(schemaObj?.schema_json);
  const [data, setData] = useState<string | undefined>(assertionData);
  const [error, setError] = useState<{ json?: string; clientDb?: string }>({});

  //   useEffect(() => {
  //     if (open) {
  //       // setJson(schemaJson || ""); // Fallback to empty string if prop is missing
  //       // setClientDb(clientDbValue || 0);
  //     }
  //   }, [open, schemaJson, clientDbValue]);

  const actions: DialogAction[] = [
    {
      label: "Close",
      color: "inherit",
      onClick: onClose,
    },
  ];

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
`;

  return (
    <ResponsiveDialogue
      open={open}
      onClose={onClose}
      title="View Assertion"
      actions={actions}
      maxWidth="xl"
      content={
        <>
          {/* // dark:border-slate-800 dark:bg-slate-900 acts as if it's dark
          despite it not being necessarily dark. TODO. */}
          <div className="flex flex-col gap-4">
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-inner">
              {assertionData ? (
                <article className="prose prose-slate prose-code:before:content-none prose-code:after:content-none /* Typography Colors */ prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 /* Code Styling (Technical Contrast) */ prose-code:text-indigo-600 prose-code:bg-indigo-50/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium /* List Styling */ prose-li:marker:text-slate-400 prose-pre:bg-foreground max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {assertionData}
                  </ReactMarkdown>
                </article>
              ) : (
                <p className="py-10 text-center text-slate-400 italic">
                  No assertion details available.
                </p>
              )}
            </div>
          </div>
          <p className="text-subtle m-3.5 text-center text-sm opacity-80">
            All responses are AI-generated and may not always be accurate or
            complete. They should be independently reviewed and verified by a
            domain expert. WatchtowerDB is NOT responsible for any actions taken
            based on these responses.
          </p>
        </>
      }
    />
  );
}
