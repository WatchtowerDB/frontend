import Pagination from "@/components/Pagination"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAssertions } from "@/hooks/useAssertions"
import { useAssertionStore } from "@/stores/useAssertionStore"

export default function AssertionsFooter() {
  const { totalPages, totalCount, isFetching } = useAssertions()

  const page = useAssertionStore((s) => s.page)
  const setPage = useAssertionStore((s) => s.setPage)
  console.log(totalPages)

  return (
    <TooltipProvider>
      {/* Pagination used in the Assertions List */}
      <Pagination
        className="m-1 ml-2"
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        isFetching={isFetching}
        onPageChange={setPage}
        size="xs"
      />
    </TooltipProvider>
  )
}
