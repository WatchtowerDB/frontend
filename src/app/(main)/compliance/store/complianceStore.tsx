import { create } from "zustand";
import { useSchemaStore } from "./schemaStore";
import { toast } from "sonner";

interface ComplianceState {
  // Data
  checkResults: any[];
  assertions: AssertionItem[];

  // UI state
  loading: boolean;
  error: string | null;

  // Actions
  fetchAssertions: () => Promise<void>;
  fetchAssertionsCount: () => Promise<number | undefined>;
  runCheck: (frameworkId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
  schemas: [],
  selectedSchemaId: null,
  checkResults: [],
  assertions: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  fetchAssertions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/assertions");
      if (!res.ok) throw new Error("Failed to fetch assertions");
      const data = await res.json();
      console.log("assertion fetched is", data);
      set({ assertions: data.results, loading: false });
      console.log("Fetched assertions:", data);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error(err);
    }
  },

  fetchAssertionsCount: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/assertions");
      if (!res.ok) throw new Error("Failed to fetch assertions");
      const data = await res.json();
      set({ assertions: data, loading: false });
      console.log("Fetched assertions:", data);
      return data.length;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error(err);
      return 0;
    }
  },

  runCheck: async (frameworkId: number) => {
    const selectedSchema = useSchemaStore.getState().selectedSchema;
    console.log("Zustand runcheck started, selected Schema", selectedSchema);
    if (!selectedSchema) {
      console.log("No selected schema!", selectedSchema);
      toast.error("Select a schema!")
      set({ error: "No schema selected" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await fetch("/api/assertions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framework: frameworkId, schema: selectedSchema }),
      });

      console.log("WE MADE IT HERE Mid way through ruuncheck");
      const data = await res.json();
      set({ checkResults: data, loading: false });
      console.log("Compliance check results:", data);
    } catch (err: any) {
      console.log("Clearly it failed");
      set({ error: err.message, loading: false });
      console.error(err);
    }
  },
}));
