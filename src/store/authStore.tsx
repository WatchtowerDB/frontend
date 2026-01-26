import { create } from "zustand";

// TODO: There's a massive likelihood that this whole store is useless. Get rid of it if by the end, it's completely uselsss.

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  getToken: () => string | null;
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  user?: { id: string; name: string }; // TODO - make it display user on the bottom left.
}

// Helper to read token from localStorage on initialization
const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null; // SSR safety, TODO elaborate further
  return localStorage.getItem("token");
};

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  token: getInitialToken(),

  setToken: (token) => {
    set({ token });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      document.cookie = `authtoken=${token}; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`;
    }
  },

  clearToken: () => {
    set({ token: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  },

  getToken: () => {
    const token = get().token;

    // fallback to read from localstorage if there is a cookie for the token already.. msotly temporary until i do login
    if (!token && typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      document.cookie = `authtoken=${token}; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`;
      if (stored) {
        set({ token: stored });
      }
    }

    return token;
  },
}));
