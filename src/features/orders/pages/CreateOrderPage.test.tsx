import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { buildOrder } from '../../../test/factories'
import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'
import type { Order } from '../api/types'

const ORDERS_URL = '/api/v1/orders'

type CapturedRequest = { idempotencyKey: string | null; body: unknown }

// Registra cada POST recebido e responde com as respostas na ordem informada.
function respondToCreate(...responses: Array<() => Response | Promise<Response>>) {
  const requests: CapturedRequest[] = []
  server.use(
    http.post(ORDERS_URL, async ({ request }) => {
      requests.push({ idempotencyKey: request.headers.get('Idempotency-Key'), body: await request.json() })
      const respond = responses[Math.min(requests.length, responses.length) - 1]
      return respond()
    }),
  )
  return requests
}

function serveOrder(order: Order) {
  server.use(http.get(`${ORDERS_URL}/:id`, () => HttpResponse.json(order)))
}

async function fillValidForm(user: ReturnType<typeof renderApp>['user']) {
  await user.selectOptions(screen.getByLabelText('Moeda'), 'EUR')
  await user.selectOptions(screen.getByLabelText('Operação'), 'Sell')
  await user.type(screen.getByLabelText('Valor em moeda estrangeira'), '250,50')
  await user.type(screen.getByLabelText('Nome do beneficiário'), 'Maria Silva')
  await user.selectOptions(screen.getByLabelText('País'), 'PT')
  await user.type(screen.getByLabelText('Conta'), 'PT50000201231234567890154')
}

describe('CreateOrderPage', () => {
  it('valida os campos, liga os erros aos campos e foca o primeiro inválido', async () => {
    const requests = respondToCreate(() => HttpResponse.json(buildOrder(), { status: 201 }))
    const { user } = renderApp('/orders/new')

    await user.click(await screen.findByRole('button', { name: 'Cotar e criar ordem' }))

    const amount = screen.getByLabelText('Valor em moeda estrangeira')
    await waitFor(() => expect(document.activeElement).toBe(amount))
    expect(amount.getAttribute('aria-invalid')).toBe('true')
    const describedBy = amount.getAttribute('aria-describedby') ?? ''
    expect(describedBy.split(' ').map((id) => document.getElementById(id)?.textContent)).toContain('Informe o valor.')
    expect(screen.getByText('Informe o nome do beneficiário.')).toBeDefined()
    expect(screen.getByText('Informe a conta do beneficiário.')).toBeDefined()
    expect(requests).toHaveLength(0)
    expect(document.title).toBe('Nova ordem | MiniCâmbio')
  })

  it('cria a ordem com os dados do formulário e navega para os detalhes', async () => {
    const created = buildOrder({ currency: 'EUR', side: 'Sell', foreignAmount: 250.5 })
    const requests = respondToCreate(() => HttpResponse.json(created, { status: 201 }))
    serveOrder(created)
    const { user } = renderApp('/orders/new')
    await screen.findByRole('heading', { level: 1, name: 'Nova ordem' })

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Cotar e criar ordem' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Ordem de venda de EUR' })).toBeDefined()
    expect(requests).toHaveLength(1)
    expect(requests[0].body).toEqual({
      currency: 'EUR',
      side: 'Sell',
      foreignAmount: 250.5,
      beneficiary: { name: 'Maria Silva', country: 'PT', accountNumber: 'PT50000201231234567890154' },
    })
    expect(requests[0].idempotencyKey).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('mostra "Cotando..." e desabilita o envio enquanto a requisição está pendente', async () => {
    respondToCreate(async () => {
      await delay(200)
      return HttpResponse.json(buildOrder(), { status: 201 })
    })
    serveOrder(buildOrder())
    const { user } = renderApp('/orders/new')
    await screen.findByRole('heading', { level: 1, name: 'Nova ordem' })
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: 'Cotar e criar ordem' }))

    const pending = await screen.findByRole('button', { name: 'Cotando...' })
    expect((pending as HTMLButtonElement).disabled).toBe(true)
  })

  it('mostra os erros 400 do backend nos campos correspondentes', async () => {
    respondToCreate(() =>
      HttpResponse.json(
        {
          title: 'Dados inválidos',
          detail: 'Corrija os campos destacados e tente novamente.',
          errors: { 'beneficiary.accountNumber': ['A conta informada não é aceita pelo backend.'] },
        },
        { status: 400 },
      ),
    )
    const { user } = renderApp('/orders/new')
    await screen.findByRole('heading', { level: 1, name: 'Nova ordem' })
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: 'Cotar e criar ordem' }))

    const message = await screen.findByText('A conta informada não é aceita pelo backend.')
    const account = screen.getByLabelText('Conta')
    expect(account.getAttribute('aria-invalid')).toBe('true')
    expect(account.getAttribute('aria-describedby')).toContain(message.id)
    expect(document.activeElement).toBe(account)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('mostra acima do formulário os erros que não são de campo', async () => {
    respondToCreate(() =>
      HttpResponse.json({ title: 'Operação não permitida', detail: 'A moeda XYZ não é suportada.' }, { status: 422 }),
    )
    const { user } = renderApp('/orders/new')
    await screen.findByRole('heading', { level: 1, name: 'Nova ordem' })
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: 'Cotar e criar ordem' }))

    const alert = await screen.findByRole('alert')
    within(alert).getByText('Não foi possível criar a ordem.')
    within(alert).getByText('A moeda XYZ não é suportada.')
  })

  it('reenvia o mesmo formulário com o mesmo Idempotency-Key', async () => {
    const created = buildOrder()
    const requests = respondToCreate(
      () => HttpResponse.json({ title: 'Serviço indisponível', detail: 'Tente novamente.' }, { status: 503 }),
      () => HttpResponse.json(created, { status: 201 }),
    )
    serveOrder(created)
    const { user } = renderApp('/orders/new')
    await screen.findByRole('heading', { level: 1, name: 'Nova ordem' })
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: 'Cotar e criar ordem' }))
    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: 'Cotar e criar ordem' }))

    await screen.findByRole('heading', { level: 1, name: 'Ordem de compra de USD' })
    expect(requests).toHaveLength(2)
    expect(requests[0].idempotencyKey).toBeTruthy()
    expect(requests[1].idempotencyKey).toBe(requests[0].idempotencyKey)
  })
})
