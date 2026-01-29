import { useAuthStore } from '../store/authStore'
import { API_ENDPOINTS } from './endpoints'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:7002/api' // Android emulator -> host localhost
  : 'https://api.nestack.kr/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    timestamp: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
  data?: unknown
  timeout?: number
  /** Internal flag to prevent infinite refresh loops. */
  _retry?: boolean
}

// ---------------------------------------------------------------------------
// Token refresh queue
// ---------------------------------------------------------------------------

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

async function request<T>(
  method: string,
  path: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const { headers = {}, params, data, timeout = 10_000, _retry = false } = config

  // Build URL with query parameters
  let url = `${API_BASE_URL}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    const qs = searchParams.toString()
    if (qs) {
      url += `?${qs}`
    }
  }

  // Attach Authorization header
  const accessToken = useAuthStore.getState().accessToken
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }
  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }
  if (data !== undefined && method !== 'GET') {
    fetchOptions.body = JSON.stringify(data)
  }

  // Execute with timeout
  const controller = new AbortController()
  fetchOptions.signal = controller.signal
  const timer = setTimeout(() => controller.abort(), timeout)

  let response: Response
  try {
    response = await fetch(url, fetchOptions)
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timeout: ${method} ${path}`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  // --- Handle 401 with token refresh ---
  if (response.status === 401 && !_retry) {
    if (isRefreshing) {
      // Another request is already refreshing; queue this one.
      return new Promise<ApiResponse<T>>((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken: string) => {
            resolve(
              request<T>(method, path, {
                ...config,
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newToken}`,
                },
                _retry: true,
              }),
            )
          },
          reject,
        })
      })
    }

    isRefreshing = true

    try {
      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const refreshResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        },
      )

      if (!refreshResponse.ok) {
        throw new Error('Token refresh failed')
      }

      const refreshBody = (await refreshResponse.json()) as ApiResponse<{
        accessToken: string
        refreshToken: string
      }>

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        refreshBody.data

      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)
      processQueue(null, newAccessToken)

      // Retry the original request with the new token
      return request<T>(method, path, {
        ...config,
        headers: {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
        _retry: true,
      })
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      throw refreshError
    } finally {
      isRefreshing = false
    }
  }

  // --- Parse response body ---
  let body: unknown
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    body = await response.json()
  } else {
    body = await response.text()
  }

  if (!response.ok) {
    const apiError = body as ApiError | undefined
    const message =
      apiError && typeof apiError === 'object' && 'error' in apiError
        ? apiError.error.message
        : `Request failed with status ${response.status}`
    const error = new Error(message) as Error & { status: number; body: unknown }
    error.status = response.status
    error.body = body
    throw error
  }

  return body as ApiResponse<T>
}

// ---------------------------------------------------------------------------
// Helper to extract data from response
// ---------------------------------------------------------------------------

export function extractData<T>(response: ApiResponse<T>): T {
  return response.data
}

// ---------------------------------------------------------------------------
// Public API client
// ---------------------------------------------------------------------------

export const apiClient = {
  get: <T>(path: string, config?: Omit<RequestConfig, 'data'>) =>
    request<T>('GET', path, config),

  post: <T>(path: string, data?: unknown, config?: RequestConfig) =>
    request<T>('POST', path, { ...config, data }),

  put: <T>(path: string, data?: unknown, config?: RequestConfig) =>
    request<T>('PUT', path, { ...config, data }),

  patch: <T>(path: string, data?: unknown, config?: RequestConfig) =>
    request<T>('PATCH', path, { ...config, data }),

  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>('DELETE', path, config),
}

export default apiClient
