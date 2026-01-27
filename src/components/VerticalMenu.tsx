"use client";
import { useEffect, useState } from "react";
import { Home, Database, Settings, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import GppGoodIcon from "@mui/icons-material/GppGood";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import Logout from "./Logout";

const menuItems = [
  // { label: "Overview", icon: <Home />, path: "/" },
  { label: "Compliance", icon: <Shield />, path: "/compliance" },
  { label: "Database", icon: <Database />, path: "#" },
  { label: "Settings", icon: <Settings />, path: "/settings" },
];

export default function VerticalMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const initialIndex = menuItems.findIndex((item) => item.path === pathname);
    return initialIndex !== -1 ? initialIndex : 0;
  });
  const [tempIndex, setTempIndex] = useState<number | null>(null);

  const handleClick = async (target: number, page: string) => {
    if (target === activeIndex) return;
    setActiveIndex(-1);
    const step = target < activeIndex ? -1 : 1;

    for (let i = activeIndex + step; i !== target + step; i += step) {
      setTempIndex(i);
      await new Promise((res) => setTimeout(res, 80));
    }

    setTempIndex(null);
    setActiveIndex(target);
    router.push(page);
  };

  useEffect(() => {
    const currentIndex = menuItems.findIndex((item) => item.path === pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [pathname]);

  return (
    <aside className="bg-verticalbar transition-color flex h-full w-56 flex-col overflow-hidden border-r border-r-gray-400 p-4 duration-150">
      {/* <Image
        src="/watchtowerwtext2.svg"
        alt="Watchtower"
        width={300}
        height={300}
        className="rounded-md"
      /> */}
      <Logo className="self-center" />
      <div className="mb-5 h-0.5 w-[80%] self-center opacity-50 shadow-inner"></div>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              // setActiveIndex(index);
              // router.push(item.path);
              handleClick(index, item.path);
            }}
            className={`flex items-center gap-3 rounded-lg px-7 py-2 transition-[font-size] duration-150 ${
              index === activeIndex || index === tempIndex
                ? "text-text"
                : "hover:text-text text-verticalbar-unselected cursor-pointer text-sm"
            } `}
          >
            <span
              className={`flex items-center gap-3 transition-transform duration-150 ease-in-out ${
                index === activeIndex || index === tempIndex
                  ? "scale-125"
                  : "scale-100"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </span>
          </button>
        ))}
      </nav>
      <div className="mt-5 h-0.5 w-[80%] self-center bg-gray-500 opacity-50 shadow-inner"></div>
      <div className="mt-auto">
        <Logout />
        <ThemeToggle />
      </div>
    </aside>
  );
}
