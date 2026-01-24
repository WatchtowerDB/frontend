import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useSchemaStore } from "../store/schemaStore";
import { OutlinedInput } from "@mui/material";

type SchemaListProps = {
  data: SchemaItem[];
};

function SchemaList({ data }: SchemaListProps) {
  const [value, setValue] = useState<number | "">(""); // amma keep ita buck. rn value is practically useless. clean up later TODO
  const setSelectedSchema = useSchemaStore((state) => state.selectSchema);

  return (
    <Select
      value={value}
      displayEmpty
      sx={{ color: "white" }}
      onChange={(e) => {
        setValue(e.target.value);
        setSelectedSchema(e.target.value);
        console.log("Selected:", e.target.value);
      }}
    >
      <MenuItem value="" disabled>
        Select schema
      </MenuItem>
      {data.map((schema, index) => (
        <MenuItem key={index} value={schema?.id}>
          Schema {schema?.id}
        </MenuItem>
      ))}
    </Select>
  );
}

export default SchemaList;
