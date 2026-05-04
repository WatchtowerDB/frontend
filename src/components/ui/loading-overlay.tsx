import Logo from "@/components/Logo"
import Loader from "@/components/ui/loader"

interface LoadingOverlayProps {
  title?: string
  message?: string
}

export const LoadingOverlay = ({ title, message }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center supports-backdrop-blur:backdrop-blur-sm">
      <div className="flex max-w-md min-w-[20rem] flex-col items-center gap-4 rounded-[1.5rem] p-8 text-center">
        <Logo className="h-32 w-32" />
        <Loader className="mb-4" />
        <div>
          <h1 className="text-foreground text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{message}</p>
        </div>
      </div>
    </div>
  )
}
