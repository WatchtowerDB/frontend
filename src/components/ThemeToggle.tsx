import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/context/ThemeProvider"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div className="flex items-center space-x-2">
      {/* Sun Icon: Glows when it's light mode */}
      <Sun
        className={`h-4 w-4 transition-colors ${!isDark ? "text-yellow-500" : "text-muted-foreground"}`}
      />

      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-verticalbar-highlight data-[state=unchecked]:bg-verticalbar-unselected"
      />

      {/* Moon Icon: Glows when it's dark mode */}
      <Moon
        className={`h-4 w-4 transition-colors ${isDark ? "text-blue-400" : "text-muted-foreground"}`}
      />
    </div>
  )
}
