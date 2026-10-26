// Espelho manual dos contratos do serviço Orders (seção 5 da spec). Sem pacote compartilhado de propósito.

export const ORDER_STATUSES = [
  'Quoted',
  'Confirmed',
  'PaymentRequested',
  'Completed',
  'Failed',
  'Cancelled',
  'Expired',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderSide = 'Buy' | 'Sell'

const FINAL_STATUSES: ReadonlySet<OrderStatus> = new Set(['Cancelled', 'Expired', 'Completed', 'Failed'])

export function isFinalStatus(status: OrderStatus): boolean {
  return FINAL_STATUSES.has(status)
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value)
}

export type Order = {
  id: string
  currency: string
  side: OrderSide
  foreignAmount: number
  quoteId: string
  rate: number
  brlAmount: number
  quoteExpiresAt: string
  beneficiaryName: string
  beneficiaryCountry: string
  beneficiaryAccount: string
  status: OrderStatus
  paymentId: string | null
  failureReason: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  canConfirm: boolean
  canCancel: boolean
  servedBy: string
}

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  servedBy: string
}

export type ListOrdersParams = {
  status?: OrderStatus
  page: number
  pageSize: number
}
