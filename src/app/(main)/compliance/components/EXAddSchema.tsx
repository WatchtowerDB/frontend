import { useState } from "react";
import TextField from "@mui/material/TextField";
import ResponsiveDialogue from "@/components/ResponsiveDialog";
import { DialogAction } from "@/types/DialogAction";

type EditSchemaDialogProps = {
  open: boolean;
  initialJson: string;
  onClose: () => void;
  onSave: (json: string) => void;
};

export default function EditSchemaDialog({
  open,
  initialJson,
  onClose,
  onSave,
}: EditSchemaDialogProps) {
  const [json, setJson] = useState(initialJson);

  const actions: DialogAction[] = [
    {
      label: "Cancel",
      color: "inherit",
      onClick: onClose,
    },
    {
      label: "Save",
      color: "primary",
      onClick: () => onSave(json),
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
