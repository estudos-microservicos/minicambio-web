import { describe, expect, it } from 'vitest'
import { ApiError, getErrorMessage, parseProblemDetails } from './ApiError'

describe('parseProblemDetails', () => {
  it('usa title, detail e errors do ProblemDetails', () => {
    const error = parseProblemDetails(400, {
      title: 'Dados inválidos',
      detail: 'Corrija os campos destacados.',
      errors: { Currency: ['Moeda não suportada.'], Ignorado: 'não é uma lista' },
    })

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.title).toBe('Dados inválidos')
    expect(error.detail).toBe('Corrija os campos destacados.')
    expect(error.fieldErrors).toEqual({ Currency: ['Moeda não suportada.'] })
  })

  it('usa um título genérico quando o corpo não é ProblemDetails', () => {
    const error = parseProblemDetails(502, '<html>Bad Gateway</html>')

    expect(error.title).toBe('Serviço indisponível no momento. Tente novamente em instantes.')
    expect(error.detail).toBeUndefined()
    expect(error.fieldErrors).toEqual({})
  })
})

describe('getErrorMessage', () => {
  it('prefere o detail ao title', () => {
    expect(getErrorMessage(new ApiError({ status: 422, title: 'Regra violada', detail: 'A cotação expirou.' }))).toBe(
      'A cotação expirou.',
    )
  })

  it('usa o title quando não há detail', () => {
    expect(getErrorMessage(new ApiError({ status: 404, title: 'Recurso não encontrado.' }))).toBe(
      'Recurso não encontrado.',
    )
  })

  it('usa uma mensagem genérica para erros que não vieram da API', () => {
    expect(getErrorMessage(new TypeError('boom'))).toBe('Ocorreu um erro inesperado.')
  })
})
