import { GenericSidebar } from '@/components/GenericSidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import AssertionsList from './components/AssertionsList'

function AssertionsPage() {
  return (
    <div className="flex h-full w-full">
      <GenericSidebar
        children=<AssertionsList />
        className={
          'w-[30vw] group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:border-0'
        }
      />
      <SidebarInset>
        {/* The actual page content */}
        <main className="p-6">
          <h2>here I render the stuffies</h2>
        </main>
      </SidebarInset>
    </div>
  )
}

export default AssertionsPage
