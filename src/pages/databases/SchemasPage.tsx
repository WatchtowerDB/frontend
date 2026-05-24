import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { useState } from "react"
import { SchemaList } from "./components/SchemaList"
import { SchemaPreview } from "./components/SchemaPreview"
import { SchemaUploadForm } from "./components/SchemaUploadForm"

export default function SchemasPage() {
  const { databases, schemas, isLoading, isUploading, uploadSchema } = useClientDBSchemas({
    page: 1,
  })

  const [activeTab, setActiveTab] = useState("upload")
  const [selectedSchemaId, setSelectedSchemaId] = useState<number | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)

  const selectedSchema = schemas?.find((s) => s.id === selectedSchemaId)
  const previewContent = activeTab === "upload" ? fileContent : selectedSchema?.sql_definition

  const selectedInfo = selectedSchema
    ? `${databases.find((db) => db.id === selectedSchema.client_db)?.name} (v${selectedSchema.id})`
    : ""

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-row overflow-hidden">
      {/* Left Column */}
      <div className="bg-background flex h-full w-1/3 min-w-100 flex-col border-r">
        <header className="p-8 pb-4">
          <h1 className="text-2xl font-bold">Database Schemas</h1>
          <p className="text-muted-foreground text-sm">Manage your SQL schema definitions.</p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="px-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload a Schema</TabsTrigger>
              <TabsTrigger value="schemas">Schemas</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="flex-1 overflow-auto p-8 pt-4">
            <SchemaUploadForm
              databases={databases}
              isUploading={isUploading}
              onUpload={uploadSchema}
              onPreviewChange={setFileContent}
            />
          </TabsContent>

          <TabsContent value="schemas" className="flex-1 overflow-hidden pt-4">
            <ScrollArea className="h-full">
              <SchemaList
                schemas={schemas || []}
                databases={databases}
                selectedSchemaId={selectedSchemaId}
                onSelect={setSelectedSchemaId}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <SchemaPreview content={previewContent} activeTab={activeTab} selectedInfo={selectedInfo} />
    </div>
  )
}
