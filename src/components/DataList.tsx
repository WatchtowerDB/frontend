import { cn } from "@/lib/utils";

type Column<T> = {
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
};

type DataListProps<T> = {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
};

export function DataList<T>({
  data,
  columns,
  emptyMessage = "No data found.",
}: DataListProps<T>) {
  return (
    <div className="w-full rounded-md border bg-background">
      {/* Header */}
      <div
        className="grid border-b px-4 py-2 text-sm font-medium text-muted-foreground"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col, i) => (
          <div key={i} className={cn("px-2", col.className)}>
            {col.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="divide-y">
        {data.length > 0 ? (
          data.map((item, rowIndex) => (
            <div
              key={rowIndex}
              className="grid items-center px-4 py-3 hover:bg-muted/50 transition-colors"
              style={{
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
              }}
            >
              {columns.map((col, colIndex) => (
                <div key={colIndex} className={cn("px-2", col.className)}>
                  {col.render(item)}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
