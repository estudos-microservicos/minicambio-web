import type { Order, PagedResult } from '../features/orders/api/types'

let sequence = 0

export function buildOrder(overrides: Partial<Order> = {}): Order {
  sequence += 1
  const suffix = String(sequence).padStart(12, '0')
  return {
    id: `0192f0c4-0000-7000-8000-${suffix}`,
    currency: 'USD',
    side: 'Buy',
    foreignAmount: 1000,
    quoteId: `0192f0c4-0000-7000-9000-${suffix}`,
    rate: 5.427,
    brlAmount: 5427,
    quoteExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    beneficiary: { name: 'Maria Silva', country: 'US', accountNumber: '123456789' },
    status: 'Quoted',
    paymentId: null,
    failureReason: null,
    confirmedAt: null,
    cancelledAt: null,
    createdAt: '2026-10-26T12:00:00Z',
    updatedAt: '2026-10-26T12:00:00Z',
    canConfirm: true,
    canCancel: true,
    servedBy: 'orders-api-test',
    ...overrides,
  }
}

export function buildPage(items: Order[], overrides: Partial<PagedResult<Order>> = {}): PagedResult<Order> {
  return {
    items,
    page: 1,
    pageSize: 20,
    totalCount: items.length,
    servedBy: 'orders-api-test',
    ...overrides,
  }
}
