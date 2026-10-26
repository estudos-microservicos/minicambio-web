import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listOrders } from './ordersApi'
import { isFinalStatus, type ListOrdersParams, type Order, type PagedResult } from './types'

export const LIST_POLLING_INTERVAL_MS = 5_000

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: ListOrdersParams) => [...orderKeys.lists(), params] as const,
}

// Polling só enquanto houver na página alguma ordem que ainda pode mudar de status.
// Será substituído por eventos numa etapa futura, junto com o worker de reconciliação do Orders.
export function getListRefetchInterval(data: PagedResult<Order> | undefined): number | false {
  return data?.items.some((order) => !isFinalStatus(order.status)) ? LIST_POLLING_INTERVAL_MS : false
}

export function useOrdersList(params: ListOrdersParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: ({ signal }) => listOrders(params, signal),
    // Mantém a página anterior na tela enquanto a próxima carrega (troca de página ou de filtro).
    placeholderData: keepPreviousData,
    refetchInterval: (query) => getListRefetchInterval(query.state.data),
  })
}
