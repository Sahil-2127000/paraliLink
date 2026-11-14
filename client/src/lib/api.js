/** Error thrown for any non-2xx API response. `details` carries field errors etc. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details ?? {}
  }
}

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

/**
 * Small fetch wrapper: JSON in and out, cookies included (the session is an
 * httpOnly cookie), and `{ data }` unwrapped. Throws ApiError on failure.
 */
export async function api(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, 'Can’t reach ParaliLink. Check your internet connection and try again.')
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error?.message ?? 'Something went wrong. Please try again.', payload?.error?.details)
  }
  return payload.data
}
