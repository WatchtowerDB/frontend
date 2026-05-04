import Logo from "@/components/Logo"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { APP_NAV } from "@/config/app-nav"
import { User } from "lucide-react"
import { Link } from "react-router-dom"
import ThemeToggle from "../ThemeToggle"
import { Logout } from "./Logout"

export function Navbar() {
  // const { accessToken, setAccessToken } = useAuthStore()
  // const refreshToken = localStorage.getItem("refresh_token")

  return (
    <NavigationMenu className="flex w-full max-w-none justify-between ps-2">
      {/* Logo */}
      <div className="me-1 mt-1">
        <Logo width={35} height={35} />
      </div>

      {/* Navigation Options */}
      <div className="flex flex-1">
        <NavigationMenuList>
          {APP_NAV.map((item) => (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to={item.url} className="flex items-center gap-2">
                  {/* {item.icon && <item.icon className="size-4" />} */}
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>

      {/* Profile & Logout */}
      <div className="me-5 ml-auto flex items-center justify-end gap-4">
        <div className="border-muted-foreground/50 text-muted-foreground flex h-9 w-9 items-center justify-center rounded-full border border-dashed">
          <User className="size-5" />
        </div>
        <ThemeToggle />
      </div>
      {/* <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => toast(accessToken + "and the refresh is" + String(refreshToken))}
      >
        Spit auth stuff
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setAccessToken(null)}
      >
        Kill access!
      </Button> */}
      <div className="mr-5">
        <Logout />
      </div>
    </NavigationMenu>
  )
}
