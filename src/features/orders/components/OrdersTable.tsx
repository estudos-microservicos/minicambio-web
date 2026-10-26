import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDateTime } from '../../../shared/utils/formatDateTime'
import type { Order } from '../api/types'
import { ORDER_SIDE_LABELS } from './labels'
import { OrderStatusBadge } from './OrderStatusBadge'
import styles from './OrdersTable.module.css'

type OrdersTableProps = {
  orders: Order[]
  totalCount: number
}

export function OrdersTable({ orders, totalCount }: OrdersTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          {totalCount === 1 ? '1 ordem' : `${totalCount} ordens`}, da mais recente para a mais antiga
        </caption>
        <thead>
          <tr>
            <th scope="col">Criada em</th>
            <th scope="col">Moeda</th>
            <th scope="col">Operação</th>
            <th scope="col" className={styles.numeric}>
              Valor estrangeiro
            </th>
            <th scope="col" className={styles.numeric}>
              Valor em BRL
            </th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <time dateTime={order.createdAt}>{formatDateTime(order.createdAt)}</time>
              </td>
              <td>{order.currency}</td>
              <td>{ORDER_SIDE_LABELS[order.side]}</td>
              <td className={styles.numeric}>{formatCurrency(order.foreignAmount, order.currency)}</td>
              <td className={styles.numeric}>{formatCurrency(order.brlAmount, 'BRL')}</td>
              <td>
                <OrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
