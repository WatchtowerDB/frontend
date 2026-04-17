import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export const MainLayout = () => {
  return (
    // min-h-svh ensures it fills the viewport even on mobile devices
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <Navbar />
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};