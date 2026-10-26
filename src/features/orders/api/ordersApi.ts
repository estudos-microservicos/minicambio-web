import { httpRequest } from '../../../shared/api/httpClient'
import type { ListOrdersParams, Order, PagedResult } from './types'

const BASE_PATH = '/api/v1/orders'

export function listOrders({ status, page, pageSize }: ListOrdersParams, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (status) query.set('status', status)
  return httpRequest<PagedResult<Order>>(`${BASE_PATH}?${query}`, { signal })
}
