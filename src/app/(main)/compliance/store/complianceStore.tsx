import { create } from "zustand";
import { useSchemaStore } from "./schemaStore";
import { toast } from "sonner";
import { request } from "@/hooks/request";

interface ComplianceState {
  // Data
  checkResults: any[];
  assertions: AssertionItem[];

  // UI state
  loading: boolean;
  error: string | null;

  // Actions
  fetchAssertions: () => Promise<void>;
  fetchAssertionsBySchema: (schemaId: number) => Promise<void>;
  // solid mental idea. have a refresh button (checks the current schema's assertions) and a play button in assertionsCard.
  // and change Violations to Assertions. Cuz it's not necessarily a violation.

  //<3
  fetchAssertionsCount: () => Promise<number | undefined>;
  runCheck: (frameworkId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
  checkResults: [],
  assertions: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  fetchAssertions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await request("/api/assertions");
      if (!res.ok) throw new Error("Failed to fetch assertions");
      const data = await res.json();
      console.log("assertion fetched is", data);
      set({ assertions: data.results, loading: false });
      console.log("Fetched assertions:", data);
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error(err);
      throw err;
    }
  },

  fetchAssertionsBySchema: async (schemaId: number) => { // clear up the comments TODO.
    // 1. Setup UI state
    set({ loading: true, error: null });

    try {
      // 2. Pass the ID as a query parameter
      const res = await request(`/api/assertions?schema_id=${schemaId}`);

      // 3. Robust Error Handling (Gold Standard)
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const msg =
          errorData?.detail ||
          errorData?.error ||
          "Failed to fetch filtered assertions";
        throw new Error(msg);
      }

      const data = await res.json();

      // 4. Update state (assuming DRF results structure)
      set({
        assertions: data.results || data,
        loading: false,
      });
    } catch (err: any) {
      // 5. Global sync + Re-throw for local UI catch
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchAssertionsCount: async () => {
    set({ loading: true, error: null });
    try {
      const res = await request("/api/assertions");
      if (!res.ok) throw new Error("Failed to fetch assertions");
      const data = await res.json();
      set({ assertions: data, loading: false });
      console.log("Fetched assertions:", data);
      return data.length;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error(err);
      throw err;
      // return 0;
    }
  },

  runCheck: async (frameworkId: number) => {
    const selectedSchema = useSchemaStore.getState().selectedSchema;
    console.log("Zustand runcheck started, selected Schema", selectedSchema);
    if (!selectedSchema) {
      console.log("No selected schema!", selectedSchema);
      toast.error("Select a schema!");
      set({ error: "No schema selected" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await request("/api/assertions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework: frameworkId,
          schema: selectedSchema,
        }),
      });

      console.log("WE MADE IT HERE Mid way through ruuncheck");
      const data = await res.json();
      set({ checkResults: data, loading: false });
      console.log("Compliance check results:", data);
      toast.success("Compliance check has been initiated. Please wait.");
    } catch (err: any) {
      console.log("Clearly it failed");
      set({ error: err.message, loading: false });
      console.error(err);
      throw err;
    }
  },
}));
