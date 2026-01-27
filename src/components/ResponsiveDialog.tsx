import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { DialogAction } from "@/types/DialogAction";

type ResponsiveDialogueProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  actions?: DialogAction[];
};

const ResponsiveDialogue: React.FC<ResponsiveDialogueProps> = ({
  open,
  onClose,
  title,
  content,
  actions = [],
}) => {

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        // "& .MuiPaper-root": {
        //   backgroundColor: backgroundColor,
        //   color: textColor,
        // },
      }}
    >
      <DialogTitle
        sx={{ color: `CHANGEME !important`, "*": { color: "CHANGEME" } }}
      >
        {title}
      </DialogTitle>
      <DialogContent
      >
        {content}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action?.onClick}
              color={action?.color || "primary"}
              variant="contained"
              sx={{ marginRight: 1 }}
            >
              {action?.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ResponsiveDialogue;
