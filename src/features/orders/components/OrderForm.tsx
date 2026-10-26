import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError, getErrorMessage } from '../../../shared/api/ApiError'
import { Button } from '../../../shared/components/Button'
import { FormField } from '../../../shared/components/FormField'
import type { CreateOrderRequest } from '../api/types'
import {
  COUNTRIES,
  CREATE_ORDER_DEFAULT_VALUES,
  CREATE_ORDER_FIELDS,
  CURRENCIES,
  createOrderSchema,
  isCreateOrderField,
  type CreateOrderFormOutput,
  type CreateOrderFormValues,
} from '../schemas/createOrderSchema'
import { ORDER_SIDE_LABELS } from './labels'
import styles from './OrderForm.module.css'

type OrderFormProps = {
  // Deve rejeitar com ApiError em caso de falha, para o formulário mostrar o erro no lugar certo.
  onSubmit: (request: CreateOrderRequest) => Promise<void>
}

export function OrderForm({ onSubmit }: OrderFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderFormValues, unknown, CreateOrderFormOutput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: CREATE_ORDER_DEFAULT_VALUES,
    // O RHF move o foco para o primeiro campo inválido ao submeter.
    shouldFocusError: true,
  })

  async function submit(values: CreateOrderFormOutput) {
    setFormError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      showSubmitError(error)
    }
  }

  // 400 do backend: cada erro vai para o seu campo (as chaves usam o mesmo caminho, ex.: "beneficiary.name").
  // Os demais erros (422, 503, rede...) aparecem acima do formulário.
  function showSubmitError(error: unknown) {
    const fieldErrors = error instanceof ApiError ? Object.entries(error.fieldErrors) : []
    const mapped = CREATE_ORDER_FIELDS.flatMap((field) => {
      const messages = fieldErrors.find(([key]) => key === field)?.[1]
      return messages?.length ? [{ field, message: messages[0] }] : []
    })

    mapped.forEach(({ field, message }, index) =>
      setError(field, { type: 'server', message }, { shouldFocus: index === 0 }),
    )

    const unmapped = fieldErrors.filter(([key]) => !isCreateOrderField(key)).flatMap(([, messages]) => messages)
    if (mapped.length === 0 || unmapped.length > 0) {
      setFormError(unmapped.length > 0 ? unmapped.join(' ') : getErrorMessage(error))
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(submit)}>
      {formError && (
        <div role="alert" className={styles.formError}>
          <p className={styles.formErrorTitle}>Não foi possível criar a ordem.</p>
          <p>{formError}</p>
        </div>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Operação</legend>
        <div className={styles.grid}>
          <FormField label="Moeda" error={errors.currency?.message}>
            {(control) => (
              <select {...control} {...register('currency')}>
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Operação" error={errors.side?.message}>
            {(control) => (
              <select {...control} {...register('side')}>
                <option value="Buy">{ORDER_SIDE_LABELS.Buy} (cliente compra a moeda estrangeira)</option>
                <option value="Sell">{ORDER_SIDE_LABELS.Sell} (cliente vende a moeda estrangeira)</option>
              </select>
            )}
          </FormField>

          <FormField
            label="Valor em moeda estrangeira"
            hint="Use vírgula ou ponto para os centavos (até 2 casas)."
            error={errors.foreignAmount?.message}
          >
            {(control) => <input {...control} {...register('foreignAmount')} inputMode="decimal" autoComplete="off" />}
          </FormField>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Beneficiário</legend>
        <div className={styles.grid}>
          <FormField
            label="Nome do beneficiário"
            hint="Nomes contendo FAIL simulam recusa no pagamento."
            error={errors.beneficiary?.name?.message}
          >
            {(control) => <input {...control} {...register('beneficiary.name')} autoComplete="name" maxLength={120} />}
          </FormField>

          <FormField
            label="País"
            hint="Coreia do Norte e Irã simulam bloqueio de compliance."
            error={errors.beneficiary?.country?.message}
          >
            {(control) => (
              <select {...control} {...register('beneficiary.country')}>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          <FormField label="Conta" error={errors.beneficiary?.accountNumber?.message}>
            {(control) => (
              <input {...control} {...register('beneficiary.accountNumber')} autoComplete="off" maxLength={34} />
            )}
          </FormField>
        </div>
      </fieldset>

      <div className={styles.actions}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cotando...' : 'Cotar e criar ordem'}
        </Button>
      </div>
    </form>
  )
}
