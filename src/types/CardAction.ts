type CardAction = {
    icon: React.ReactNode;
    onClick: () => void;
    color?:
      | "inherit"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "info"
      | "warning";
};
