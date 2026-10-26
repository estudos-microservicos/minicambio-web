import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { OrderStatus } from '../api/types'
import { OrderStatusBadge } from './OrderStatusBadge'

describe('OrderStatusBadge', () => {
  it.each<[OrderStatus, string]>([
    ['Quoted', 'Cotada'],
    ['Confirmed', 'Confirmada'],
    ['PaymentRequested', 'Pagamento solicitado'],
    ['Completed', 'Concluída'],
    ['Failed', 'Falhou'],
    ['Cancelled', 'Cancelada'],
    ['Expired', 'Expirada'],
  ])('mostra %s como o texto "%s"', (status, label) => {
    render(<OrderStatusBadge status={status} />)

    expect(screen.getByText(label)).toBeDefined()
  })
})
