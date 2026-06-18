import { APIError } from "@/types/api"
import type { AxiosError } from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toAPIError = (error: unknown): APIError => {
  const axiosError = error as AxiosError<{ detail: string }>
  return new APIError(
    axiosError.response?.data?.detail ?? "An unexpected error occurred.",
    axiosError.response?.status ?? 500,
  )
}
