import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelOrder, confirmOrder, createOrder, getOrder, listOrders } from './ordersApi'
import { isFinalStatus, type CreateOrderRequest, type ListOrdersParams, type Order, type PagedResult } from './types'

export const LIST_POLLING_INTERVAL_MS = 5_000
export const DETAILS_POLLING_INTERVAL_MS = 3_000

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: ListOrdersParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

// Polling só enquanto houver na página alguma ordem que ainda pode mudar de status.
// Será substituído por eventos numa etapa futura, junto com o worker de reconciliação do Orders.
export function getListRefetchInterval(data: PagedResult<Order> | undefined): number | false {
  return data?.items.some((order) => !isFinalStatus(order.status)) ? LIST_POLLING_INTERVAL_MS : false
}

export function getDetailsRefetchInterval(data: Order | undefined): number | false {
  return data && !isFinalStatus(data.status) ? DETAILS_POLLING_INTERVAL_MS : false
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

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: ({ signal }) => getOrder(id, signal),
    refetchInterval: (query) => getDetailsRefetchInterval(query.state.data),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ request, idempotencyKey }: { request: CreateOrderRequest; idempotencyKey: string }) =>
      createOrder(request, idempotencyKey),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order)
      return queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

export function useConfirmOrder(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => confirmOrder(id),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(id), order)
      return queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
    // 422 (ex.: cotação expirou) muda o status no servidor: busca a ordem de novo para refletir isso.
    onError: () => queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) }),
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSettled: (_data, _error, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
      ]),
  })
}
