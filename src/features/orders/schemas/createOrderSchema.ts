import { z } from 'zod'

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF'] as const

// Lista curta, incluindo os países bloqueados pelo mock do Payments (KP e IR) para permitir testar a recusa.
export const COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'CH', name: 'Suíça' },
  { code: 'KP', name: 'Coreia do Norte' },
  { code: 'IR', name: 'Irã' },
] as const

const COUNTRY_CODES = COUNTRIES.map((country) => country.code) as [string, ...string[]]

// Número positivo com no máximo 2 casas decimais; aceita vírgula ou ponto como separador decimal.
const AMOUNT_PATTERN = /^\d+([.,]\d{1,2})?$/

// Espelha a validação do backend (Orders): valor > 0 com até 2 casas, nome até 120 e conta até 34 caracteres.
export const createOrderSchema = z.object({
  currency: z.enum(CURRENCIES, { error: 'Selecione a moeda.' }),
  side: z.enum(['Buy', 'Sell'], { error: 'Selecione a operação.' }),
  foreignAmount: z
    .string()
    .trim()
    .min(1, 'Informe o valor.')
    .regex(AMOUNT_PATTERN, 'Informe um número com no máximo 2 casas decimais.')
    .transform((value) => Number(value.replace(',', '.')))
    .refine((value) => value > 0, 'O valor deve ser maior que zero.'),
  beneficiary: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome do beneficiário.')
      .max(120, 'O nome deve ter no máximo 120 caracteres.'),
    country: z.enum(COUNTRY_CODES, { error: 'Selecione o país do beneficiário.' }),
    accountNumber: z
      .string()
      .trim()
      .min(1, 'Informe a conta do beneficiário.')
      .max(34, 'A conta deve ter no máximo 34 caracteres.'),
  }),
})

export type CreateOrderFormValues = z.input<typeof createOrderSchema>
export type CreateOrderFormOutput = z.output<typeof createOrderSchema>

export const CREATE_ORDER_DEFAULT_VALUES: CreateOrderFormValues = {
  currency: 'USD',
  side: 'Buy',
  foreignAmount: '',
  beneficiary: { name: '', country: 'BR', accountNumber: '' },
}

// Campos do formulário com o mesmo caminho das chaves de erro do backend (ex.: "beneficiary.name").
export const CREATE_ORDER_FIELDS = [
  'currency',
  'side',
  'foreignAmount',
  'beneficiary.name',
  'beneficiary.country',
  'beneficiary.accountNumber',
] as const

export type CreateOrderField = (typeof CREATE_ORDER_FIELDS)[number]

export function isCreateOrderField(value: string): value is CreateOrderField {
  return CREATE_ORDER_FIELDS.some((field) => field === value)
}
