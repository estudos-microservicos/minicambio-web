import { describe, expect, it } from 'vitest'
import { buildOrder, buildPage } from '../../../test/factories'
import { getListRefetchInterval, LIST_POLLING_INTERVAL_MS } from './queries'

describe('getListRefetchInterval', () => {
  it('não faz polling antes de ter dados', () => {
    expect(getListRefetchInterval(undefined)).toBe(false)
  })

  it('não faz polling quando todas as ordens da página estão em estado final', () => {
    const page = buildPage([
      buildOrder({ status: 'Completed' }),
      buildOrder({ status: 'Failed' }),
      buildOrder({ status: 'Cancelled' }),
      buildOrder({ status: 'Expired' }),
    ])

    expect(getListRefetchInterval(page)).toBe(false)
  })

  it.each(['Quoted', 'Confirmed', 'PaymentRequested'] as const)(
    'faz polling quando há uma ordem em %s na página',
    (status) => {
      const page = buildPage([buildOrder({ status: 'Completed' }), buildOrder({ status })])

      expect(getListRefetchInterval(page)).toBe(LIST_POLLING_INTERVAL_MS)
    },
  )
})
