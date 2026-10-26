import { createUuid } from '../utils/createUuid'
import { ApiError, fallbackTitle, parseProblemDetails } from './ApiError'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('Content-Type') ?? ''
  if (!contentType.includes('json')) return undefined
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

// Todas as chamadas usam caminho relativo (/api/v1/...): o proxy do Vite (dev) ou o nginx (container)
// encaminham para o Orders, então nenhuma URL de backend fica embutida no build.
export async function httpRequest<T>(
  path: string,
  { method = 'GET', body, headers, signal }: RequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')
  requestHeaders.set('X-Correlation-Id', createUuid())
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    // Cancelamento feito pelo próprio app (ex.: TanStack Query trocou de página) não é falha de rede.
    if (signal?.aborted) throw error
    throw new ApiError({ status: 0, title: fallbackTitle(0) })
  }

  if (response.status === 204) return undefined as T

  const payload = await readJson(response)
  if (!response.ok) throw parseProblemDetails(response.status, payload)
  return payload as T
}
