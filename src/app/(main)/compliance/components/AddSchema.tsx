import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import ResponsiveDialogue from "@/components/ResponsiveDialog";
import { DialogAction } from "@/types/DialogAction";
import { useSchemaStore } from "../store/schemaStore";

type AddSchemaDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (json: string, clientDb: number) => void;
  schemaJson: string | undefined;
  clientDbValue: number | undefined;
};

export default function AddSchemaDialog({
  open,
  onClose,
  onSave,
  schemaJson,
  clientDbValue,
}: AddSchemaDialogProps) {
  // const schemas = useSchemaStore((state) => state.schemas);
  // const selectedSchema = useSchemaStore((state) => state.selectedSchema);
  // const schemaObj = schemas.find((s) => s.id === selectedSchema);
  // const [json, setJson] = useState<string | undefined>(schemaObj?.schema_json);
  const [json, setJson] = useState<string>("");
  const [clientDb, setClientDb] = useState<string>("");
  const [error, setError] = useState<{ json?: string; clientDb?: string }>({});

  useEffect(() => {
    if (open) {
      // setJson(schemaJson || ""); // Fallback to empty string if prop is missing
      // setClientDb(clientDbValue || 0);
    }
  }, [open, schemaJson, clientDbValue]);

  const actions: DialogAction[] = [
    {
      label: "Cancel",
      color: "inherit",
      onClick: onClose,
    },
    {
      label: "Save",
      color: "primary",
      onClick: () => {
        setError({});
        if (json !== undefined && clientDb !== undefined) {
          onSave(json, +clientDb);
        }
      },
    },
  ];

  return (
    <ResponsiveDialogue
      open={open}
      onClose={onClose}
      title="Add Schema"
      actions={actions}
      content={
        <div className="flex flex-col gap-2 p-2">
          <TextField
            required={true}
            multiline
            label={"Schema JSON"}
            error={!!error.json}
            helperText={error.json}
            minRows={14}
            fullWidth
            value={json}
            onChange={(e) => {
              setJson(e.target.value);
              setError((prev) => ({ ...prev, json: "" }));
            }}
            placeholder="Input the schema JSON here"
            variant="outlined"
            sx={{
              fontFamily: "monospace",
            }}
          />
          <TextField
            required={true}
            label={"Client DB"}
            type="number"
            error={!!error.clientDb}
            helperText={error.clientDb}
            minRows={1}
            fullWidth
            value={clientDb}
            onChange={(e) => {
              setClientDb(e.target.value);
              setError((prev) => ({ ...prev, clientDb: "" }));
            }}
            placeholder="Input the client DB number"
            variant="outlined"
            sx={{
              fontFamily: "monospace",
            }}
          />
        </div>
      }
    />
  );
}
