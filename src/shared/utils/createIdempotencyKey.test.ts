import { afterEach, describe, expect, it, vi } from 'vitest'
import { createIdempotencyKey } from './createIdempotencyKey'

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('createIdempotencyKey', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('gera chaves UUID v4 diferentes a cada chamada', () => {
    const first = createIdempotencyKey()
    const second = createIdempotencyKey()

    expect(first).toMatch(UUID_V4_PATTERN)
    expect(second).toMatch(UUID_V4_PATTERN)
    expect(first).not.toBe(second)
  })

  it('usa getRandomValues quando randomUUID não está disponível (HTTP sem TLS)', () => {
    const getRandomValues = vi.fn(crypto.getRandomValues.bind(crypto))
    vi.stubGlobal('crypto', { getRandomValues })

    expect(createIdempotencyKey()).toMatch(UUID_V4_PATTERN)
    expect(getRandomValues).toHaveBeenCalledOnce()
  })
})
