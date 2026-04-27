import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"
import Logo from "@/components/Logo"
import { LogOut, User } from "lucide-react"
import { Button } from "../ui/button"
import { APP_NAV } from "@/config/app-nav" // wherever you store it

export function Navbar() {
  return (
    <NavigationMenu className="ps-5 flex justify-between w-full max-w-none">
      {/* Logo */}
      <div className="mt-1 me-1">
        <Logo width={35} height={35} />
      </div>

      {/* Navigation Options */}
      <div className="flex flex-1">
        <NavigationMenuList>
          {APP_NAV.map((item) => (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
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
      <div className="ml-auto flex items-center gap-4 justify-end me-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground">
          <User className="size-5" />
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </NavigationMenu>
  )
}