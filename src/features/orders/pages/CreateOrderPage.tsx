import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAnnouncer } from '../../../shared/hooks/useAnnouncer'
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle'
import { createIdempotencyKey } from '../../../shared/utils/createIdempotencyKey'
import { useCreateOrder } from '../api/queries'
import type { CreateOrderRequest } from '../api/types'
import { OrderForm } from '../components/OrderForm'
import styles from './Page.module.css'

export function CreateOrderPage() {
  useDocumentTitle('Nova ordem')
  const navigate = useNavigate()
  const announce = useAnnouncer()
  const createOrder = useCreateOrder()

  // Uma chave por instância do formulário: reenviar (duplo clique, retry após erro de rede) reaproveita a mesma
  // chave e o Orders devolve a ordem já criada. Só depois de um sucesso é gerada uma nova.
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey)

  async function handleSubmit(request: CreateOrderRequest) {
    const order = await createOrder.mutateAsync({ request, idempotencyKey })
    setIdempotencyKey(createIdempotencyKey())
    announce('Ordem criada. Confirme antes que a cotação expire.')
    await navigate(`/orders/${order.id}`)
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Nova ordem</h1>
          <p className={styles.subtitle}>
            A ordem é criada com uma cotação válida por 60 segundos. Depois é só confirmar para solicitar o pagamento.
          </p>
        </div>
      </div>
      <OrderForm onSubmit={handleSubmit} />
    </>
  )
}
