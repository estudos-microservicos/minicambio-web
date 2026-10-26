import { useId } from 'react'
import { isOrderStatus, ORDER_STATUSES, type OrderStatus } from '../api/types'
import { ORDER_STATUS_LABELS } from './labels'
import styles from './StatusFilter.module.css'

type StatusFilterProps = {
  value: OrderStatus | undefined
  onChange: (status: OrderStatus | undefined) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const id = useId()
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        Status
      </label>
      <select
        id={id}
        className={styles.select}
        value={value ?? ''}
        onChange={(event) => onChange(isOrderStatus(event.target.value) ? event.target.value : undefined)}
      >
        <option value="">Todos</option>
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ORDER_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  )
}
