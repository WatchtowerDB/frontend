import { Navbar } from '@/components/layout/Navbar'
import { Outlet } from 'react-router-dom'

export const MainLayout = () => {
  return (
    // min-h-svh ensures it fills the viewport even on mobile devices
    <div className="flex min-h-svh flex-col">
      <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
        <Navbar />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
