export type FieldErrors = Record<string, string[]>

type ApiErrorInit = {
  status: number
  title: string
  detail?: string
  fieldErrors?: FieldErrors
}

// status 0 indica que não houve resposta HTTP (rede fora, servidor inacessível).
export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail?: string
  readonly fieldErrors: FieldErrors

  constructor({ status, title, detail, fieldErrors = {} }: ApiErrorInit) {
    super(detail ?? title)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
    this.fieldErrors = fieldErrors
  }
}

export function fallbackTitle(status: number): string {
  if (status === 0) return 'Não foi possível conectar ao servidor.'
  if (status === 400) return 'Os dados enviados são inválidos.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 422) return 'A operação não pode ser realizada.'
  if (status >= 500) return 'Serviço indisponível no momento. Tente novamente em instantes.'
  return 'Ocorreu um erro inesperado.'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function parseFieldErrors(value: unknown): FieldErrors {
  if (!isRecord(value)) return {}
  const fieldErrors: FieldErrors = {}
  for (const [field, messages] of Object.entries(value)) {
    if (Array.isArray(messages)) {
      fieldErrors[field] = messages.filter((message): message is string => typeof message === 'string')
    }
  }
  return fieldErrors
}

// Converte uma resposta de erro no formato ProblemDetails (RFC 9457) em ApiError. Corpos vazios ou que não
// sejam ProblemDetails (ex.: página de erro do nginx) recebem um título genérico conforme o status.
export function parseProblemDetails(status: number, body: unknown): ApiError {
  const problem = isRecord(body) ? body : {}
  return new ApiError({
    status,
    title: nonEmptyString(problem.title) ?? fallbackTitle(status),
    detail: nonEmptyString(problem.detail),
    fieldErrors: parseFieldErrors(problem.errors),
  })
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.detail ?? error.title
  return fallbackTitle(-1)
}
