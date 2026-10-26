import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../shared/api/ApiError'

// Erros 4xx não mudam com nova tentativa; falhas de rede e 5xx tentam mais duas vezes.
function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry },
    },
  })
}
