type CardAction = {
    icon: React.ReactNode;
    onClick: () => void;
    label?: string;
    color?:
      | "inherit"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "info"
      | "warning";
};
