export type DialogAction = {
    label: string;
    onClick: () => void;
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
}
