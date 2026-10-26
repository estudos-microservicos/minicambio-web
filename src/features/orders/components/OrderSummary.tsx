import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDateTime } from '../../../shared/utils/formatDateTime'
import { formatRate } from '../../../shared/utils/formatRate'
import type { Order } from '../api/types'
import { countryLabel, ORDER_SIDE_LABELS } from './labels'
import { OrderStatusBadge } from './OrderStatusBadge'
import styles from './OrderSummary.module.css'

type OrderSummaryProps = {
  order: Order
}

function DateTime({ value }: { value: string | null }) {
  return value ? <time dateTime={value}>{formatDateTime(value)}</time> : <>—</>
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <div className={styles.sections}>
      <section aria-labelledby="resumo-cotacao" className={styles.section}>
        <h2 id="resumo-cotacao" className={styles.heading}>
          Cotação
        </h2>
        <dl className={styles.list}>
          <dt>Operação</dt>
          <dd>
            {ORDER_SIDE_LABELS[order.side]} de {order.currency}
          </dd>
          <dt>Valor estrangeiro</dt>
          <dd>{formatCurrency(order.foreignAmount, order.currency)}</dd>
          <dt>Taxa</dt>
          <dd>{formatRate(order.rate)} BRL</dd>
          <dt>Valor em BRL</dt>
          <dd>{formatCurrency(order.brlAmount, 'BRL')}</dd>
          <dt>Cotação válida até</dt>
          <dd>
            <DateTime value={order.quoteExpiresAt} />
          </dd>
        </dl>
      </section>

      <section aria-labelledby="resumo-beneficiario" className={styles.section}>
        <h2 id="resumo-beneficiario" className={styles.heading}>
          Beneficiário
        </h2>
        <dl className={styles.list}>
          <dt>Nome</dt>
          <dd>{order.beneficiary.name}</dd>
          <dt>País</dt>
          <dd>{countryLabel(order.beneficiary.country)}</dd>
          <dt>Conta</dt>
          <dd>{order.beneficiary.accountNumber}</dd>
        </dl>
      </section>

      <section aria-labelledby="resumo-acompanhamento" className={styles.section}>
        <h2 id="resumo-acompanhamento" className={styles.heading}>
          Acompanhamento
        </h2>
        <dl className={styles.list}>
          <dt>Status</dt>
          <dd>
            <OrderStatusBadge status={order.status} />
          </dd>
          <dt>Criada em</dt>
          <dd>
            <DateTime value={order.createdAt} />
          </dd>
          <dt>Confirmada em</dt>
          <dd>
            <DateTime value={order.confirmedAt} />
          </dd>
          <dt>Cancelada em</dt>
          <dd>
            <DateTime value={order.cancelledAt} />
          </dd>
          <dt>Pagamento</dt>
          <dd className={styles.mono}>{order.paymentId ?? '—'}</dd>
          <dt>Atualizada em</dt>
          <dd>
            <DateTime value={order.updatedAt} />
          </dd>
          <dt>Atendida por</dt>
          <dd className={styles.mono}>{order.servedBy}</dd>
        </dl>
      </section>
    </div>
  )
}
