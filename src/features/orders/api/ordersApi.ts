import { httpRequest } from '../../../shared/api/httpClient'
import type { CreateOrderRequest, ListOrdersParams, Order, PagedResult } from './types'

const BASE_PATH = '/api/v1/orders'

export function listOrders({ status, page, pageSize }: ListOrdersParams, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (status) query.set('status', status)
  return httpRequest<PagedResult<Order>>(`${BASE_PATH}?${query}`, { signal })
}

export function getOrder(id: string, signal?: AbortSignal) {
  return httpRequest<Order>(`${BASE_PATH}/${encodeURIComponent(id)}`, { signal })
}

// A mesma chave em envios repetidos faz o Orders devolver a ordem já criada, em vez de criar outra.
export function createOrder(request: CreateOrderRequest, idempotencyKey: string) {
  return httpRequest<Order>(BASE_PATH, {
    method: 'POST',
    body: request,
    headers: { 'Idempotency-Key': idempotencyKey },
  })
}

export function confirmOrder(id: string) {
  return httpRequest<Order>(`${BASE_PATH}/${encodeURIComponent(id)}/confirm`, { method: 'POST' })
}

// Cancelamento lógico: a ordem continua existindo, com status Cancelled.
export function cancelOrder(id: string) {
  return httpRequest<void>(`${BASE_PATH}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
