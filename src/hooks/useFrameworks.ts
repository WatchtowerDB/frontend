import { getFrameworks } from "@/api/frameworks"
import { useQuery } from "@tanstack/react-query"

export function useFrameworks() {
  return useQuery({
    queryKey: ["frameworks", "list"],
    queryFn: () => getFrameworks(),
    staleTime: 1000 * 60 * 30, // 30 min — frameworks rarely change
    placeholderData: (prev) => prev,
  })
}
