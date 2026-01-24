type SchemaItem = {
  id: number;
  schema_json: string;
  created_at: string;
  client_db: number;
};

type SchemaResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SchemaItem[];
};