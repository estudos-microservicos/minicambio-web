import { createUuid } from './createUuid'

// Chave enviada no header Idempotency-Key ao criar uma ordem. Funciona também fora de contexto seguro
// (HTTP sem TLS), porque createUuid tem fallback com crypto.getRandomValues.
export function createIdempotencyKey(): string {
  return createUuid()
}
