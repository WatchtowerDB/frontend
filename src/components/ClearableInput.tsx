import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
import * as React from "react"

interface ClearableInputProps extends React.ComponentProps<typeof Input> {
  onClear?: () => void
  showClear?: boolean
}

function ClearableInput({
  className,
  onClear,
  showClear,
  type = "text",
  ...props
}: ClearableInputProps) {
  return (
    <div className="relative flex w-full items-center">
      <Input
        type={type}
        className={cn("pr-8", className)}
        {...props}
      />

      {showClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring absolute right-2.5 rounded-md p-0.5 transition-colors outline-none focus-visible:ring-2"
        >
          <XIcon className="pointer-events-none h-3.5 w-3.5" />
          <span className="sr-only">Clear input</span>
        </button>
      )}
    </div>
  )
}

export { ClearableInput }
