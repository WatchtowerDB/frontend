import Card from "@/components/Card";
import React, { useEffect, useState } from "react";
import SchemaIcon from "@mui/icons-material/Schema";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import { useSchemaStore } from "../store/schemaStore";
import SchemaList from "./SchemaList";
import EditSchemaDialog from "./EditSchema";

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
  const updateSchema = useSchemaStore((state) => state.updateSchema);

  //Editting related constants, dont mind em.
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editingJson, setEditingJson] = useState<SchemaItem | null>(null);

  // Editting related functions
  const handleEditClick = () => {
    const schemaObj = schemas.find((s) => s.id === selectedSchema);
    console.log("schemaobjis ", schemaObj);
    if (!schemaObj) return;
    setEditingJson(schemaObj); // hydrate the dialog
    setEditOpen(true);
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
      icon: <EditSquareIcon />,
      onClick: () => handleEditClick(),
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
      {editingJson && (
        <EditSchemaDialog
          open={editOpen}
          schemaJson={editingJson.schema_json}
          onClose={() => setEditOpen(false)}
          onSave={(updatedJson) => {
            console.log("The new json is", updatedJson)
            updateSchema(selectedSchema, updatedJson, editingJson.client_db);
            setEditOpen(false);
          }}
        />
      )}
    </>
  );
}

export default SchemaCard;
