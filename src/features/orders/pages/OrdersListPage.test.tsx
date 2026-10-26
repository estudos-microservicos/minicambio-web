import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { buildOrder, buildPage } from '../../../test/factories'
import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'
import type { Order, PagedResult } from '../api/types'

const ORDERS_URL = '/api/v1/orders'

// Responde sempre com a mesma página e guarda a query string de cada requisição recebida.
function respondWith(page: PagedResult<Order>) {
  const requests: URLSearchParams[] = []
  server.use(
    http.get(ORDERS_URL, ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json(page)
    }),
  )
  return requests
}

describe('OrdersListPage', () => {
  it('mostra as ordens com valores formatados e o status em texto', async () => {
    respondWith(
      buildPage([
        buildOrder({ currency: 'USD', side: 'Buy', foreignAmount: 1000, brlAmount: 5427, status: 'Quoted' }),
        buildOrder({ currency: 'EUR', side: 'Sell', foreignAmount: 250.5, brlAmount: 1450.15, status: 'Completed' }),
      ]),
    )

    renderApp('/orders')

    const table = await screen.findByRole('table', { name: /2 ordens/ })
    const [, usdRow, eurRow] = within(table).getAllByRole('row')
    within(usdRow).getByRole('cell', { name: 'Compra' })
    within(usdRow).getByRole('cell', { name: formatCurrency(1000, 'USD') })
    within(usdRow).getByRole('cell', { name: formatCurrency(5427, 'BRL') })
    within(usdRow).getByText('Cotada')
    within(eurRow).getByRole('cell', { name: 'Venda' })
    within(eurRow).getByRole('cell', { name: formatCurrency(250.5, 'EUR') })
    within(eurRow).getByRole('cell', { name: formatCurrency(1450.15, 'BRL') })
    within(eurRow).getByText('Concluída')
    expect(document.title).toBe('Ordens | MiniCâmbio')
  })

  it('redireciona a raiz para a lista de ordens', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { level: 1, name: 'Ordens' })).toBeDefined()
  })

  it('filtra por status e envia o filtro para a API', async () => {
    const requests: URLSearchParams[] = []
    server.use(
      http.get(ORDERS_URL, ({ request }) => {
        const params = new URL(request.url).searchParams
        requests.push(params)
        const orders = [buildOrder({ status: 'Quoted' }), buildOrder({ status: 'Completed' })]
        const status = params.get('status')
        return HttpResponse.json(buildPage(status ? orders.filter((order) => order.status === status) : orders))
      }),
    )
    const { user } = renderApp('/orders')
    await screen.findByRole('table', { name: /2 ordens/ })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'Concluída')

    const table = await screen.findByRole('table', { name: /1 ordem,/ })
    within(table).getByText('Concluída')
    expect(requests.at(-1)?.get('status')).toBe('Completed')
    expect(requests.at(-1)?.get('page')).toBe('1')
  })

  it('abre com o filtro e a página informados na URL', async () => {
    const requests = respondWith(buildPage([buildOrder({ status: 'Failed' })], { page: 2, totalCount: 21 }))

    renderApp('/orders?status=Failed&page=2')

    await screen.findByText('Página 2 de 2')
    expect(screen.getByRole<HTMLSelectElement>('combobox', { name: 'Status' }).value).toBe('Failed')
    expect(requests[0].get('status')).toBe('Failed')
    expect(requests[0].get('page')).toBe('2')
  })

  it('navega entre as páginas', async () => {
    const requests: URLSearchParams[] = []
    server.use(
      http.get(ORDERS_URL, ({ request }) => {
        const params = new URL(request.url).searchParams
        requests.push(params)
        return HttpResponse.json(buildPage([buildOrder()], { page: Number(params.get('page')), totalCount: 45 }))
      }),
    )
    const { user } = renderApp('/orders')
    await screen.findByText('Página 1 de 3')
    expect(screen.getByRole('button', { name: 'Anterior' }).getAttribute('aria-disabled')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'Próxima' }))

    await screen.findByText('Página 2 de 3')
    await waitFor(() => expect(requests.at(-1)?.get('page')).toBe('2'))
    expect(screen.getByRole('button', { name: 'Anterior' }).getAttribute('aria-disabled')).toBe('false')
  })

  it('mostra o estado vazio quando não há ordens', async () => {
    renderApp('/orders')

    expect(await screen.findByText('Nenhuma ordem encontrada.')).toBeDefined()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('mostra o erro da API e permite tentar novamente', async () => {
    server.use(
      http.get(
        ORDERS_URL,
        () => HttpResponse.json({ title: 'Serviço indisponível', detail: 'O Orders está fora do ar.' }, { status: 503 }),
        { once: true },
      ),
      http.get(ORDERS_URL, () => HttpResponse.json(buildPage([buildOrder()]))),
    )
    const { user } = renderApp('/orders')

    const alert = await screen.findByRole('alert')
    within(alert).getByText('Não foi possível carregar as ordens.')
    within(alert).getByText('O Orders está fora do ar.')

    await user.click(within(alert).getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByRole('table', { name: /1 ordem,/ })).toBeDefined()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
