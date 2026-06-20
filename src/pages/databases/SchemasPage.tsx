import Pagination from "@/components/Pagination"
import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClientDBSchemas } from "@/hooks/useClientDBSchemas"
import { useState } from "react"
import { SchemaList } from "./components/SchemaList"
import { SchemaPreview } from "./components/SchemaPreview"
import { SchemaUploadForm } from "./components/SchemaUploadForm"

export default function SchemasPage() {
  const [currentPage, setCurrentPage] = useState(1)

  const { databases, schemas, isLoading, schemasLoading, isUploading, uploadSchema, totalCount } =
    useClientDBSchemas({
      page: currentPage,
      latest: true,
    })
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedSchemaId, setSelectedSchemaId] = useState<number | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)

  const selectedSchema = schemas?.find((s) => s.id === selectedSchemaId)
  const previewContent = activeTab === "upload" ? fileContent : selectedSchema?.sql_definition

  const totalPages = Math.ceil(totalCount / (Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20))
  // TODO: FIGURE OUT WHY THERE IS NO HORIZONTAL SCROLL ON THE PREVIEWS
  const selectedInfo =
    activeTab === "upload"
      ? "Preview"
      : selectedSchema
        ? `${databases.find((db) => db.id === selectedSchema.client_db)?.name} › ${selectedSchema.name} (v${selectedSchema.internal_version})`
        : ""

  return (
    <div className="flex h-full w-full flex-row overflow-hidden">
      {/* Left Column */}
      <div className="bg-background flex h-full w-1/3 min-w-100 flex-col border-r">
        <header className="pl- p-4">
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
          {/* Upload tab */}
          <TabsContent value="upload" className="flex-1 overflow-auto p-8 pt-4">
            <SchemaUploadForm
              databases={databases}
              isUploading={isUploading}
              onUpload={uploadSchema}
              onPreviewChange={setFileContent}
              schemasLoading={schemasLoading}
            />
          </TabsContent>
          {/* Schemas list tab */}
          <TabsContent value="schemas" className="flex h-full flex-1 flex-col overflow-hidden pt-4">
            {isLoading ? (
              <div className="flex h-full min-h-0 w-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <ScrollArea className="h-full min-h-0">
                <SchemaList
                  schemas={schemas || []}
                  databases={databases}
                  selectedSchemaId={selectedSchemaId}
                  onSelect={setSelectedSchemaId}
                />
              </ScrollArea>
            )}
            <div className="bg-muted/20 border-t p-2">
              <Pagination
                page={currentPage}
                totalPages={totalPages || 1}
                totalCount={totalCount}
                isFetching={isLoading}
                onPageChange={(p) => setCurrentPage(p)}
                size="xs"
                showTotal={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* The schema preview portion of the page */}
      <SchemaPreview content={previewContent} activeTab={activeTab} selectedInfo={selectedInfo} />
    </div>
  )
}
