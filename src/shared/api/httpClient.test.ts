import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../test/server'
import { ApiError } from './ApiError'
import { httpRequest } from './httpClient'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

describe('httpRequest', () => {
  it('envia JSON com X-Correlation-Id e devolve o corpo da resposta', async () => {
    let received: Request | undefined
    server.use(
      http.post('/api/v1/echo', ({ request }) => {
        received = request.clone()
        return HttpResponse.json({ ok: true })
      }),
    )

    const result = await httpRequest<{ ok: boolean }>('/api/v1/echo', { method: 'POST', body: { value: 1 } })

    expect(result).toEqual({ ok: true })
    expect(received?.headers.get('X-Correlation-Id')).toMatch(UUID_PATTERN)
    expect(received?.headers.get('Content-Type')).toBe('application/json')
    expect(await received?.json()).toEqual({ value: 1 })
  })

  it('devolve undefined em 204 sem tentar ler o corpo', async () => {
    server.use(http.delete('/api/v1/echo', () => new HttpResponse(null, { status: 204 })))

    expect(await httpRequest('/api/v1/echo', { method: 'DELETE' })).toBeUndefined()
  })

  it('converte respostas de erro em ApiError', async () => {
    server.use(http.get('/api/v1/echo', () => new HttpResponse(null, { status: 404 })))

    const error = await httpRequest('/api/v1/echo').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, title: 'Recurso não encontrado.' })
  })

  it('converte falha de rede em ApiError com status 0', async () => {
    server.use(http.get('/api/v1/echo', () => HttpResponse.error()))

    const error = await httpRequest('/api/v1/echo').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0, title: 'Não foi possível conectar ao servidor.' })
  })
})
