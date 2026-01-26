"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

function Logout() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      useAuthStore.getState().setAuthenticated(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
