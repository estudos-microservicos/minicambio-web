import { describe, expect, it } from 'vitest'
import { CREATE_ORDER_DEFAULT_VALUES, createOrderSchema, type CreateOrderFormValues } from './createOrderSchema'

function validValues(overrides: Partial<CreateOrderFormValues> = {}): CreateOrderFormValues {
  return {
    ...CREATE_ORDER_DEFAULT_VALUES,
    foreignAmount: '1000.50',
    beneficiary: { name: 'Maria Silva', country: 'US', accountNumber: '123456789' },
    ...overrides,
  }
}

function errorPaths(values: CreateOrderFormValues): string[] {
  const result = createOrderSchema.safeParse(values)
  // Um campo pode ter mais de um problema (ex.: vazio e fora do formato); interessa quais campos falharam.
  return result.success ? [] : [...new Set(result.error.issues.map((issue) => issue.path.join('.')))]
}

describe('createOrderSchema', () => {
  it('aceita uma ordem válida e converte o valor para número', () => {
    const result = createOrderSchema.parse(validValues({ foreignAmount: ' 1500,25 ' }))

    expect(result).toEqual({
      currency: 'USD',
      side: 'Buy',
      foreignAmount: 1500.25,
      beneficiary: { name: 'Maria Silva', country: 'US', accountNumber: '123456789' },
    })
  })

  it.each(['', '0', '0.00', '-10', 'abc', '10.123', '1.000,50'])('recusa o valor "%s"', (foreignAmount) => {
    expect(errorPaths(validValues({ foreignAmount }))).toEqual(['foreignAmount'])
  })

  it.each(['10', '10.5', '10,55', '0.01'])('aceita o valor "%s"', (foreignAmount) => {
    expect(errorPaths(validValues({ foreignAmount }))).toEqual([])
  })

  it('exige nome do beneficiário com até 120 caracteres', () => {
    const base = validValues()

    expect(errorPaths({ ...base, beneficiary: { ...base.beneficiary, name: '   ' } })).toEqual(['beneficiary.name'])
    expect(errorPaths({ ...base, beneficiary: { ...base.beneficiary, name: 'a'.repeat(121) } })).toEqual([
      'beneficiary.name',
    ])
    expect(errorPaths({ ...base, beneficiary: { ...base.beneficiary, name: 'a'.repeat(120) } })).toEqual([])
  })

  it('exige conta com até 34 caracteres', () => {
    const base = validValues()

    expect(errorPaths({ ...base, beneficiary: { ...base.beneficiary, accountNumber: '' } })).toEqual([
      'beneficiary.accountNumber',
    ])
    expect(errorPaths({ ...base, beneficiary: { ...base.beneficiary, accountNumber: '1'.repeat(35) } })).toEqual([
      'beneficiary.accountNumber',
    ])
  })

  it('recusa moeda, operação e país fora das listas', () => {
    const base = validValues()

    const invalid = { ...base, currency: 'XYZ', side: 'Hold', beneficiary: { ...base.beneficiary, country: 'ZZ' } }

    expect(errorPaths(invalid as unknown as CreateOrderFormValues)).toEqual(['currency', 'side', 'beneficiary.country'])
  })
})
