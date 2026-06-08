import { Button, type ButtonProps } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { useState } from "react"

export function useCopyToClipboard(resetInterval = 2000) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async (text: string) => {
    if (!navigator?.clipboard) return false

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), resetInterval)
      return true
    } catch (error) {
      console.error("Copy failed", error)
      setIsCopied(false)
      return false
    }
  }

  return { isCopied, copy }
}

interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  textToCopy: string
  showText?: boolean
}

export default function CopyButton({
  textToCopy,
  showText = false,
  children,
  className,
  variant = "outline",
  size = "icon",
  ...props
}: CopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard()

  return (
    <Button
      variant={variant}
      size={showText || children ? "default" : size}
      onClick={() => copy(textToCopy)}
      className={`gap-2 transition-all duration-200 ${className ?? ""}`}
      aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
      {...props}
    >
      {isCopied ? (
        <Check className="animate-in fade-in zoom-in h-4 w-4 text-green-500 duration-200" />
      ) : (
        <Copy className="h-4 w-4" />
      )}

      {showText && <span>{isCopied ? "Copied!" : "Copy"}</span>}
      {!showText && children}
    </Button>
  )
}
