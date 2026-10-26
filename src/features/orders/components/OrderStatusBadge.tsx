import type { OrderStatus } from '../api/types'
import { ORDER_STATUS_LABELS } from './labels'
import styles from './OrderStatusBadge.module.css'

type Tone = 'info' | 'progress' | 'success' | 'danger' | 'neutral'

const STATUS_TONES: Record<OrderStatus, Tone> = {
  Quoted: 'info',
  Confirmed: 'progress',
  PaymentRequested: 'progress',
  Completed: 'success',
  Failed: 'danger',
  Cancelled: 'neutral',
  Expired: 'neutral',
}

type OrderStatusBadgeProps = {
  status: OrderStatus
}

// O status sempre aparece como texto; a cor é só reforço visual.
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[STATUS_TONES[status]]}`}>{ORDER_STATUS_LABELS[status]}</span>
}
