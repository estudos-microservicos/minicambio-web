import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError, getErrorMessage } from '../../../shared/api/ApiError'
import { Button } from '../../../shared/components/Button'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState'
import { useAnnouncer } from '../../../shared/hooks/useAnnouncer'
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle'
import { useCancelOrder, useConfirmOrder, useOrder } from '../api/queries'
import { isFinalStatus, type Order, type OrderStatus } from '../api/types'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { failureReasonLabel, ORDER_SIDE_LABELS, ORDER_STATUS_LABELS } from '../components/labels'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrderSummary } from '../components/OrderSummary'
import { QuoteCountdown } from '../components/QuoteCountdown'
import styles from './Page.module.css'

export function OrderDetailsPage() {
  const { id = '' } = useParams()
  // key: trocar de ordem recomeça o estado local (cotação expirada, diálogo, erros).
  return <OrderDetails key={id} id={id} />
}

function orderTitle(order: Order): string {
  return `Ordem de ${ORDER_SIDE_LABELS[order.side].toLowerCase()} de ${order.currency}`
}

function OrderDetails({ id }: { id: string }) {
  const orderQuery = useOrder(id)
  const confirmOrder = useConfirmOrder(id)
  const cancelOrder = useCancelOrder()
  const announce = useAnnouncer()
  const [quoteExpired, setQuoteExpired] = useState(false)
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // Status que já foi anunciado pela própria ação do usuário (ex.: "Ordem cancelada."), para não repetir.
  const announcedByActionRef = useRef<OrderStatus | null>(null)

  const order = orderQuery.data
  const isNotFound = orderQuery.error instanceof ApiError && orderQuery.error.status === 404
  useDocumentTitle(order ? orderTitle(order) : isNotFound ? 'Ordem não encontrada' : 'Detalhes da ordem')
  useStatusAnnouncement(order?.status, announcedByActionRef)

  const { refetch } = orderQuery
  const handleQuoteExpired = useCallback(() => {
    setQuoteExpired(true)
    void refetch()
  }, [refetch])

  function handleConfirm() {
    setActionError(null)
    confirmOrder.mutate(undefined, { onError: (error) => setActionError(getErrorMessage(error)) })
  }

  function openCancelDialog() {
    setCancelError(null)
    setCancelDialogOpen(true)
  }

  function handleCancel() {
    setCancelError(null)
    cancelOrder.mutate(id, {
      onSuccess: () => {
        announcedByActionRef.current = 'Cancelled'
        setCancelDialogOpen(false)
        announce('Ordem cancelada.')
      },
      onError: (error) => setCancelError(getErrorMessage(error)),
    })
  }

  if (!order) {
    if (isNotFound) {
      return (
        <>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Ordem não encontrada</h1>
              <p className={styles.subtitle}>Confira o endereço ou procure a ordem na lista.</p>
            </div>
          </div>
          <Link to="/orders" className={styles.backLink}>
            Voltar para a lista de ordens
          </Link>
        </>
      )
    }
    if (orderQuery.isError) {
      return (
        <ErrorState
          title="Não foi possível carregar a ordem."
          message={getErrorMessage(orderQuery.error)}
          isRetrying={orderQuery.isFetching}
          onRetry={() => void refetch()}
        />
      )
    }
    return <LoadingState message="Carregando ordem..." />
  }

  const confirmDisabled = quoteExpired || confirmOrder.isPending
  const isTrackingPayment = order.status === 'Confirmed' || order.status === 'PaymentRequested'

  return (
    <>
      <Link to="/orders" className={styles.backLink}>
        <span aria-hidden="true">← </span>Voltar para a lista
      </Link>
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{orderTitle(order)}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className={styles.mono}>{order.id}</p>
        </div>
      </div>

      {order.failureReason && (
        <div className={styles.failure}>
          <p className={styles.failureTitle}>O pagamento não foi concluído</p>
          <p>{failureReasonLabel(order.failureReason)}</p>
        </div>
      )}

      {actionError && (
        <p role="alert" className={styles.alert}>
          {actionError}
        </p>
      )}

      {orderQuery.isError && (
        <p className={styles.alert}>Não foi possível atualizar a ordem. Exibindo os últimos dados carregados.</p>
      )}

      <div className={styles.toolbar}>
        <div>
          {order.status === 'Quoted' && (
            <QuoteCountdown expiresAt={order.quoteExpiresAt} onExpire={handleQuoteExpired} />
          )}
          {isTrackingPayment && (
            <p className={styles.subtitle}>Acompanhando o pagamento. Esta página se atualiza sozinha.</p>
          )}
          {isFinalStatus(order.status) && <p className={styles.subtitle}>Esta ordem foi finalizada.</p>}
        </div>
        <div className={styles.actions}>
          {order.canConfirm && (
            <Button aria-disabled={confirmDisabled} onClick={confirmDisabled ? undefined : handleConfirm}>
              {confirmOrder.isPending ? 'Confirmando...' : 'Confirmar ordem'}
            </Button>
          )}
          {order.canCancel && (
            <Button variant="secondary" onClick={openCancelDialog}>
              Cancelar ordem
            </Button>
          )}
        </div>
      </div>

      <OrderSummary order={order} />

      <CancelOrderDialog
        open={isCancelDialogOpen}
        isCancelling={cancelOrder.isPending}
        error={cancelError}
        onConfirm={handleCancel}
        onClose={() => setCancelDialogOpen(false)}
      />
    </>
  )
}

// Anuncia mudanças de status (ex.: "Pagamento solicitado" → "Concluída" vindo do polling).
function useStatusAnnouncement(status: OrderStatus | undefined, announcedByActionRef: RefObject<OrderStatus | null>) {
  const announce = useAnnouncer()
  const previous = useRef(status)

  useEffect(() => {
    if (status && previous.current && previous.current !== status) {
      if (announcedByActionRef.current === status) {
        announcedByActionRef.current = null
      } else {
        announce(`Status da ordem: ${ORDER_STATUS_LABELS[status]}.`)
      }
    }
    previous.current = status
  }, [status, announce, announcedByActionRef])
}
