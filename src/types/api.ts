/**
 * Global API Types
 * Simply, these represent the standard envelopes used by the backend.
 */

// Every API listing we have responds in a list like this.

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Every error we get is in this form, needed so we can give the errors returned a type.
// TODO: Make sure this works across all error handling ESPECIALLY AUTHENTICATION.

export interface APIError {
  detail: string
  code?: string
  status?: number
}
