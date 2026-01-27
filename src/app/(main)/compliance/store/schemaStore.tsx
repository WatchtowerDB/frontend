import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type SchemaStoreType = {
  schemas: SchemaItem[]; // raw JSON strings
  selectedSchema: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSchemas: () => Promise<void>;
  addSchema: (schemaJson: string, clientDb: number) => Promise<void>;
  // updateSchema: (index: number, schemaJson: string, clientDb: number) => void; // schemas shouldnt be modifiable, but i'm leaving this in ic.
  removeSchema: (index: number) => void;
  clearSchemas: () => void;
  selectSchema: (index: number) => void;
};

export const useSchemaStore = create<SchemaStoreType>()(
  devtools((set, get) => ({
    //remember TODO you're using devtools.
    schemas: [],
    selectedSchema: "",
    loading: false,
    error: null,

    fetchSchemas: async () => {
      set({ loading: true, error: null });
      try {
        const response = await fetch("/api/schemas");
        if (!response.ok) throw new Error("Failed to fetch schemas");
        const data: SchemaResponse = await response.json();
        // const schemaStrings = data.results.map((item) => item.schema_json);
        set({ schemas: data.results, loading: false });
        console.log("fetchschemas say", get().schemas);
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    addSchema: async (schemaJson: string, clientDb: number) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch("/api/schemas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schema_json: schemaJson,
            client_db: clientDb,
          }),
        });

        if (!response.ok) throw new Error("Failed to upload schema");

        await get().fetchSchemas();
      } catch (err: any) {
        set({ error: err.message, loading: false });
        throw err;
      }
    },

    // updateSchema: async (id: number, updatedSchema: string, clientDb: number) => {
    //   set({ loading: true, error: null });
    //   try {
    //     const response = await fetch(`/api/schemas/${id}`, {
    //       method: "PUT",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({
    //         schemaJson: updatedSchema,
    //         clientDb: clientDb, // backend uses this to identify which schema, but still. todo: figure out client DB.
    //         // for now, I will pass it manually.
    //       }),
    //     });

    //     if (!response.ok) {
    //       const errorText = await response.text();
    //       throw new Error(`Failed to update schema: ${errorText}`);
    //     }

    //     const savedSchema: SchemaItem = await response.json();
    //     set((state) => ({
    //       schemas: state.schemas.map((s, i) => (i === id ? savedSchema : s)),
    //       loading: false,
    //     }));
    //   } catch (err: any) {
    //     set({ error: err.message, loading: false });
    //   }
    // },

    // Not to be used yet, for schemas can not be removed.
    // removeSchema: (index: number) =>
    //   set((state) => ({
    //     schemas: state.schemas.filter((_, i) => i !== index),
    //   })),

    // clearSchemas: () => set({ schemas: [] }),

    selectSchema: (index: number) => {
      set({ selectedSchema: index });
      console.log("Current selected schema is", get().selectedSchema);
    },
  })),
);
