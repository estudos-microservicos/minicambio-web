import type { OrderSide, OrderStatus } from '../api/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Quoted: 'Cotada',
  Confirmed: 'Confirmada',
  PaymentRequested: 'Pagamento solicitado',
  Completed: 'Concluída',
  Failed: 'Falhou',
  Cancelled: 'Cancelada',
  Expired: 'Expirada',
}

export const ORDER_SIDE_LABELS: Record<OrderSide, string> = {
  Buy: 'Compra',
  Sell: 'Venda',
}
