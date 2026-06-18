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

export class APIError extends Error {
  status: number
  detail: string

  constructor(detail: string, status: number) {
    super(detail)
    this.detail = detail
    this.status = status
  }
}
