import type { FailureReason, OrderSide, OrderStatus } from '../api/types'
import { COUNTRIES } from '../schemas/createOrderSchema'

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

const FAILURE_REASON_LABELS: Record<FailureReason, string> = {
  BENEFICIARY_REJECTED: 'O beneficiário foi recusado pelo provedor de pagamento.',
  COMPLIANCE_BLOCKED: 'Pagamento bloqueado pelas regras de compliance para o país do beneficiário.',
  LIMIT_EXCEEDED: 'O valor excede o limite permitido para um pagamento.',
}

export function failureReasonLabel(reason: string): string {
  return reason in FAILURE_REASON_LABELS
    ? FAILURE_REASON_LABELS[reason as FailureReason]
    : `O pagamento falhou (${reason}).`
}

export function countryLabel(code: string): string {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code
}
