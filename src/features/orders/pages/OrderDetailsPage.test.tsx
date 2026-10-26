import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { buildOrder } from '../../../test/factories'
import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'
import type { Order } from '../api/types'

const ORDER_URL = '/api/v1/orders/:id'

function inOneMinute() {
  return new Date(Date.now() + 60_000).toISOString()
}

// Servidor em memória para uma ordem: GET devolve o estado atual, confirm/DELETE o alteram.
function serveOrder(initial: Order) {
  let current = initial
  const calls = { confirm: 0, cancel: 0 }
  server.use(
    http.get(ORDER_URL, () => HttpResponse.json(current)),
    http.post(`${ORDER_URL}/confirm`, () => {
      calls.confirm += 1
      current = { ...current, status: 'PaymentRequested', canConfirm: false, canCancel: false, paymentId: 'pay-1' }
      return HttpResponse.json(current)
    }),
    http.delete(ORDER_URL, () => {
      calls.cancel += 1
      current = { ...current, status: 'Cancelled', canConfirm: false, canCancel: false }
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return calls
}

describe('OrderDetailsPage', () => {
  it('mostra o resumo e os botões quando a ordem pode ser confirmada e cancelada', async () => {
    const order = buildOrder({ quoteExpiresAt: inOneMinute(), rate: 5.427, brlAmount: 5427 })
    serveOrder(order)

    renderApp(`/orders/${order.id}`)

    expect(await screen.findByRole('heading', { level: 1, name: 'Ordem de compra de USD' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Confirmar ordem' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Cancelar ordem' })).toBeDefined()
    expect(screen.getByRole('timer')).toBeDefined()
    expect(screen.getByText('Maria Silva')).toBeDefined()
    expect(document.title).toBe('Ordem de compra de USD | MiniCâmbio')
  })

  it('esconde os botões quando canConfirm e canCancel são falsos', async () => {
    const order = buildOrder({ status: 'Completed', canConfirm: false, canCancel: false })
    serveOrder(order)

    renderApp(`/orders/${order.id}`)

    await screen.findByRole('heading', { level: 1, name: 'Ordem de compra de USD' })
    expect(screen.queryByRole('button', { name: 'Confirmar ordem' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancelar ordem' })).toBeNull()
    expect(screen.queryByRole('timer')).toBeNull()
  })

  it('mostra só o botão de cancelar quando apenas canCancel é verdadeiro', async () => {
    const order = buildOrder({ quoteExpiresAt: inOneMinute(), canConfirm: false, canCancel: true })
    serveOrder(order)

    renderApp(`/orders/${order.id}`)

    await screen.findByRole('button', { name: 'Cancelar ordem' })
    expect(screen.queryByRole('button', { name: 'Confirmar ordem' })).toBeNull()
  })

  it('confirmar chama o endpoint e atualiza o status', async () => {
    const order = buildOrder({ quoteExpiresAt: inOneMinute() })
    const calls = serveOrder(order)
    const { user } = renderApp(`/orders/${order.id}`)

    await user.click(await screen.findByRole('button', { name: 'Confirmar ordem' }))

    expect(await screen.findAllByText('Pagamento solicitado')).not.toHaveLength(0)
    expect(calls.confirm).toBe(1)
    expect(screen.queryByRole('button', { name: 'Confirmar ordem' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancelar ordem' })).toBeNull()
  })

  it('mostra a mensagem do backend quando a confirmação é recusada', async () => {
    const order = buildOrder({ quoteExpiresAt: inOneMinute() })
    serveOrder(order)
    server.use(
      http.post(`${ORDER_URL}/confirm`, () =>
        HttpResponse.json(
          { title: 'Operação não permitida', detail: 'A cotação expirou. Crie uma nova ordem.' },
          { status: 422 },
        ),
      ),
    )
    const { user } = renderApp(`/orders/${order.id}`)

    await user.click(await screen.findByRole('button', { name: 'Confirmar ordem' }))

    const alert = await screen.findByRole('alert')
    within(alert).getByText('A cotação expirou. Crie uma nova ordem.')
  })

  it('cancelar abre o diálogo com foco em "Voltar" e Esc fecha sem cancelar', async () => {
    const order = buildOrder({ quoteExpiresAt: inOneMinute() })
    const calls = serveOrder(order)
    const { user } = renderApp(`/orders/${order.id}`)
    const openButton = await screen.findByRole('button', { name: 'Cancelar ordem' })

    await user.click(openButton)

    const dialog = await screen.findByRole('dialog', { name: 'Cancelar ordem?' })
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Voltar' }))

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(calls.cancel).toBe(0)
    expect(document.activeElement).toBe(openButton)
    expect(screen.getAllByText('Cotada')).not.toHaveLength(0)
  })

  it('confirmar no diálogo cancela a ordem e anuncia o resultado', async () => {
    const order = buildOrder({ quoteExpiresAt: inOneMinute() })
    const calls = serveOrder(order)
    const { user } = renderApp(`/orders/${order.id}`)

    await user.click(await screen.findByRole('button', { name: 'Cancelar ordem' }))
    const dialog = await screen.findByRole('dialog', { name: 'Cancelar ordem?' })
    await user.click(within(dialog).getByRole('button', { name: 'Sim, cancelar ordem' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(calls.cancel).toBe(1)
    expect(await screen.findAllByText('Cancelada')).not.toHaveLength(0)
    await waitFor(() => expect(screen.getByTestId('live-announcer').textContent).toBe('Ordem cancelada.'))
    expect(screen.queryByRole('button', { name: 'Cancelar ordem' })).toBeNull()
  })

  it('desabilita a confirmação quando a cotação já expirou', async () => {
    const order = buildOrder({ quoteExpiresAt: new Date(Date.now() - 1_000).toISOString() })
    serveOrder(order)

    renderApp(`/orders/${order.id}`)

    expect(await screen.findByText('A cotação expirou.')).toBeDefined()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirmar ordem' }).getAttribute('aria-disabled')).toBe('true'),
    )
  })

  it('explica o motivo da falha do pagamento', async () => {
    const order = buildOrder({
      status: 'Failed',
      failureReason: 'COMPLIANCE_BLOCKED',
      canConfirm: false,
      canCancel: false,
    })
    serveOrder(order)

    renderApp(`/orders/${order.id}`)

    expect(
      await screen.findByText('Pagamento bloqueado pelas regras de compliance para o país do beneficiário.'),
    ).toBeDefined()
  })

  it('mostra "Ordem não encontrada" com link para a lista quando a API devolve 404', async () => {
    server.use(
      http.get(ORDER_URL, () =>
        HttpResponse.json({ title: 'Recurso não encontrado', detail: 'Ordem não encontrada.' }, { status: 404 }),
      ),
    )

    renderApp('/orders/0192f0c4-0000-7000-8000-000000000000')

    expect(await screen.findByRole('heading', { level: 1, name: 'Ordem não encontrada' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Voltar para a lista de ordens' }).getAttribute('href')).toBe('/orders')
  })
})
