import Card from "@/components/Card";
import React, { useEffect, useState } from "react";
import SchemaIcon from "@mui/icons-material/Schema";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useSchemaStore } from "../store/schemaStore";
import SchemaList from "./SchemaList";
import AddSchemaDialog from "./AddSchema";

type SchemaCardProps = {
  count: number;
};

function SchemaCard() {
  // The store variablesss
  const schemas = useSchemaStore((state) => state.schemas);
  const selectedSchema = useSchemaStore((state) => state.selectedSchema);
  const loading = useSchemaStore((state) => state.loading);
  const error = useSchemaStore((state) => state.error);

  //The store functions
  const fetchSchemas = useSchemaStore((state) => state.fetchSchemas);
  const addSchema = useSchemaStore((state) => state.addSchema);

  //Editting related constants, dont mind em.
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [addingJson, setAddingJson] = useState<string>();
  const [addingClientDb, setAddingClientDb] = useState<number>();

  // Editting related functions
  const handleAddClick = () => {
    // const schemaObj = schemas.find((s) => s.id === selectedSchema);
    // console.log("schemaobjis ", schemaObj);
    // if (!schemaObj) return;
    setAddingJson(""); // hydrate the dialog
    setAddOpen(true);
  };

  // const handleEdit = async (newJson: SchemaItem) => {
  //   updateSchema(selectedSchema, newJson);
  //   setEditOpen(false);
  // };

  useEffect(() => {
    fetchSchemas();
  }, [fetchSchemas]);

  const actions: CardAction[] = [
    {
      icon: <AddBoxIcon />,
      onClick: () => handleAddClick(),
    },
  ];
  return (
    <>
      <Card
        bgColor="bg-gradient-to-b from-blue-600 to-blue-800"
        icon={() => <SchemaIcon />}
        actions={actions}
        special={<SchemaList data={schemas} />}
      />
      {addOpen && (
        <AddSchemaDialog
          open={addOpen}
          schemaJson={addingJson}
          clientDbValue={addingClientDb}
          onClose={() => setAddOpen(false)}
          onSave={async (newJson, newClientDb) => {
            // 1. Mark as async
            console.log("The new json is", newJson);

            try {
              // 2. Wait for the store action to actually finish
              await addSchema(newJson, newClientDb);

              // 3. This line only runs if addSchema SUCCEEDED
              setAddOpen(false);
            } catch (err) {
              // 4. This runs if addSchema THREW an error
              // We do NOT call setAddOpen(false) here, so the dialog stays open
              console.error("Upload failed, keeping dialog open:", err);
            }
          }}
        />
      )}
    </>
  );
}

export default SchemaCard;
