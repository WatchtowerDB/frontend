import { APIError } from "@/types/api"
import type { AxiosError } from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

export const toAPIError = (error: unknown): APIError => {
  const axiosError = error as AxiosError<{ detail: string }>
  return new APIError(
    axiosError.response?.data?.detail ?? "An unexpected error occurred.",
    axiosError.response?.status ?? 500,
  )
}
