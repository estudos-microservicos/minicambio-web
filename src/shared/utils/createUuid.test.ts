import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUuid } from './createUuid'

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('createUuid', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('gera um UUID v4 com crypto.randomUUID', () => {
    expect(createUuid()).toMatch(UUID_V4_PATTERN)
  })

  it('gera um UUID v4 com getRandomValues quando randomUUID não existe (HTTP sem TLS)', () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })

    const first = createUuid()
    const second = createUuid()

    expect(first).toMatch(UUID_V4_PATTERN)
    expect(second).toMatch(UUID_V4_PATTERN)
    expect(first).not.toBe(second)
  })
})
