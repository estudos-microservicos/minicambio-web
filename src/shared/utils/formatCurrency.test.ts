import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatCurrency'

// Intl usa espaço não separável (U+00A0) entre o símbolo e o valor.
describe('formatCurrency', () => {
  it.each([
    [1234.5, 'BRL', 'R$ 1.234,50'],
    [1000, 'USD', 'US$ 1.000,00'],
    [0.1, 'EUR', '€ 0,10'],
  ])('formata %d %s como %s', (value, currency, expected) => {
    expect(formatCurrency(value, currency)).toBe(expected)
  })
})
