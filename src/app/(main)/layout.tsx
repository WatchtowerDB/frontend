import VerticalMenu from "@/components/VerticalMenu";
import { Toaster } from "sonner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-background">
      <div className="m-auto flex h-[95vh] w-[95%] bg-gray-300 shadow-[0_6px_12px_-2px_rgba(0,0,0,0.15),6px_6px_15px_-5px_rgba(0,0,0,0.2),-3px_-3px_10px_-5px_rgba(0,0,0,0.05)]">
        <VerticalMenu />
        <main
          className="bg-foreground flex-1 overflow-hidden p-6"
          style={{ transitionProperty: "background-color", transitionDuration: "150ms" }}
        >
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}