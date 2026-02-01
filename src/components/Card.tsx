import { Button, IconButton, Tooltip } from "@mui/material";
import React from "react";

type CardProps = {
  icon: React.ElementType;
  bgColor?: string;
  info?: {
    title?: string;
    value?: string | number;
    color?: "blue" | "yellow" | "green" | "purple";
  };
  actions?: CardAction[];
  special?: React.ReactNode;
};

// const Colors: Record<string, string> = {
//   red: "bg-red-500",
//   blue: "bg-blue-500",
//   green: "bg-green-500",
//   yellow: "bg-yellow-500",
//   purple: "bg-purple-500",
// };

export default function Card({
  icon: Icon,
  info,
  actions,
  special: Special,
  bgColor,
}: CardProps) {
  return (
    <div
      className={`border-border relative flex flex-row items-center gap-6 rounded-md border p-6 opacity-90 shadow-lg transition-all hover:shadow-xl ${bgColor}`}
    >
      <div className="justify-start">
        <div className={`rounded-lg bg-blue-100 p-3`}>
          <Icon
            className={`h-10 w-10 ${
              info === undefined || info.color === "blue"
                ? "text-blue-500"
                : info.color === "yellow"
                  ? "text-yellow-500"
                  : info.color === "green"
                    ? "text-green-500"
                    : "text-purple-500"
            }`}
          />
        </div>
      </div>
      {Special && <div className="items-start">{Special}</div>}
      <div className="flex flex-col justify-start">
        <p className="mb-2 text-3xl text-white">{info?.value}</p>
        <p className="text-sm text-gray-300">{info?.title}</p>
      </div>
      {actions && (
        <div className="absolute -end-2.5 -bottom-0.5 mt-4">
          {actions.map((action, index) => (
            <Tooltip key={index} title={action?.label || ""}>
              <IconButton
                aria-label={action?.label}
                onClick={action?.onClick}
                color={action?.color || "primary"}
                sx={{ marginRight: 1 }}
              >
                {action?.icon}
              </IconButton>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
}
