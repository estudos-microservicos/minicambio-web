import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { getErrorMessage } from '../../../shared/api/ApiError'
import { ButtonLink } from '../../../shared/components/Button'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState'
import { Pagination } from '../../../shared/components/Pagination'
import { useAnnouncer } from '../../../shared/hooks/useAnnouncer'
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle'
import { useCancelOrder, useOrdersList } from '../api/queries'
import { isOrderStatus, type Order, type OrderStatus } from '../api/types'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { OrdersTable } from '../components/OrdersTable'
import { StatusFilter } from '../components/StatusFilter'
import styles from './OrdersListPage.module.css'

const PAGE_SIZE = 20

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

export function OrdersListPage() {
  useDocumentTitle('Ordens')
  const announce = useAnnouncer()

  // Filtro e página vivem na query string, para o link ser compartilhável e o botão voltar funcionar.
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const status = isOrderStatus(statusParam) ? statusParam : undefined
  const page = parsePage(searchParams.get('page'))

  const ordersQuery = useOrdersList({ status, page, pageSize: PAGE_SIZE })
  const { data } = ordersQuery

  const cancelOrder = useCancelOrder()
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)

  function navigate(next: { status: OrderStatus | undefined; page: number }) {
    const params = new URLSearchParams()
    if (next.status) params.set('status', next.status)
    if (next.page > 1) params.set('page', String(next.page))
    setSearchParams(params)
  }

  function openCancelDialog(order: Order) {
    setCancelError(null)
    setOrderToCancel(order)
  }

  function handleCancel() {
    if (!orderToCancel) return
    setCancelError(null)
    cancelOrder.mutate(orderToCancel.id, {
      onSuccess: () => {
        setOrderToCancel(null)
        announce('Ordem cancelada.')
      },
      onError: (error) => setCancelError(getErrorMessage(error)),
    })
  }

  function renderContent() {
    if (!data) {
      if (ordersQuery.isError) {
        return (
          <ErrorState
            title="Não foi possível carregar as ordens."
            message={getErrorMessage(ordersQuery.error)}
            isRetrying={ordersQuery.isFetching}
            onRetry={() => void ordersQuery.refetch()}
          />
        )
      }
      return <LoadingState message="Carregando ordens..." />
    }

    if (data.items.length === 0) {
      return (
        <EmptyState title="Nenhuma ordem encontrada.">
          <ButtonLink to="/orders/new">Criar ordem</ButtonLink>
        </EmptyState>
      )
    }

    return (
      <>
        {/* Falha numa atualização em segundo plano: mantém os últimos dados e o polling continua tentando. */}
        {ordersQuery.isError && (
          <p role="status" className={styles.staleWarning}>
            Não foi possível atualizar a lista. Exibindo os últimos dados carregados.
          </p>
        )}
        <OrdersTable orders={data.items} totalCount={data.totalCount} onCancel={openCancelDialog} />
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={data.totalCount}
          onPageChange={(nextPage) => navigate({ status, page: nextPage })}
        />
      </>
    )
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ordens</h1>
          <p className={styles.subtitle}>
            Acompanhe suas operações de câmbio. A lista se atualiza sozinha enquanto houver ordens em andamento.
          </p>
        </div>
        <div className={styles.headerActions}>
          <StatusFilter value={status} onChange={(nextStatus) => navigate({ status: nextStatus, page: 1 })} />
          <ButtonLink to="/orders/new">Nova ordem</ButtonLink>
        </div>
      </div>
      {renderContent()}
      <CancelOrderDialog
        open={orderToCancel !== null}
        isCancelling={cancelOrder.isPending}
        error={cancelError}
        onConfirm={handleCancel}
        onClose={() => setOrderToCancel(null)}
      />
    </>
  )
}
