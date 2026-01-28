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

  const fake: string = `## Database Schema Overview

This document describes a sample database schema used for testing structured data ingestion and validation workflows. The schema represents a simplified enterprise system and is intended solely for development and evaluation purposes.

### Entity Relationships

The schema includes core entities such as \`users\`, \`roles\`, and \`permissions\`, with clearly defined primary and foreign key relationships. These relationships enforce logical consistency while enabling flexible access control and role-based authorization.

### Constraints and Validation Rules

Several constraints are applied at the schema level, including non-null fields, unique identifiers, and referential integrity checks. These rules ensure data correctness and prevent the insertion of malformed or inconsistent records during runtime operations.

### Audit and Compliance Metadata

To support compliance and traceability, the schema incorporates audit fields such as \`created_at\`, \`updated_at\`, and \`modified_by\`. These attributes enable historical tracking of changes and facilitate accountability during security reviews and compliance assessments.
`;
  return (
    <ResponsiveDialogue
      open={open}
      onClose={onClose}
      title="View Assertion"
      actions={actions}
      maxWidth="md"
      content={
        // dark:border-slate-800 dark:bg-slate-900 acts as if it's dark despite it not being necessarily dark. TODO.
        <div className="flex flex-col gap-4">
          <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-inner">
            {assertionData ? (
              <article className="prose prose-slate /* Typography Colors */ prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 /* Code Styling (Technical Contrast) */ prose-code:text-indigo-600 prose-code:bg-indigo-50/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium /* List Styling */ prose-li:marker:text-slate-400 max-w-none">
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
      }
    />
  );
}
