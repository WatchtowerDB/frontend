import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import ResponsiveDialogue from "@/components/ResponsiveDialog";
import { DialogAction } from "@/types/DialogAction";
import { useSchemaStore } from "../store/schemaStore";

type EditSchemaDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (json: string) => void;
  schemaJson: string;
};

export default function EditSchemaDialog({
  open,
  onClose,
  onSave,
  schemaJson,
}: EditSchemaDialogProps) {
  const schemas = useSchemaStore((state) => state.schemas);
  const selectedSchema = useSchemaStore((state) => state.selectedSchema);
  const schemaObj = schemas.find((s) => s.id === selectedSchema);
  // const [json, setJson] = useState<string | undefined>(schemaObj?.schema_json);
  const [json, setJson] = useState<string>(schemaJson);

  useEffect(() => {
    if (open) {
      setJson(schemaJson);
    }
  }, [schemaJson, open]);

  const actions: DialogAction[] = [
    {
      label: "Cancel",
      color: "inherit",
      onClick: onClose,
    },
    {
      label: "Save",
      color: "primary",
      onClick: () =>{ onSave(json)},
    },
    
  ];

  return (
    <ResponsiveDialogue
      open={open}
      onClose={onClose}
      title="Edit Schema"
      actions={actions}
      content={
        <TextField
          multiline
          minRows={14}
          fullWidth
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder="Edit schema JSON here"
          variant="outlined"
          sx={{
            fontFamily: "monospace",
          }}
        />
      }
    />
  );
}
