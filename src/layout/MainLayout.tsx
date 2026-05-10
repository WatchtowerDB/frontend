import { Outlet } from "react-router-dom"
import { Navbar } from "./components/Navbar"

export const MainLayout = () => {
  return (
    <div className="flex h-svh flex-col">
      <header className="bg-background/95 sticky top-0 z-50 w-full shrink-0 border-b backdrop-blur">
        <Navbar />
      </header>

      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
