import { http, HttpResponse } from 'msw'
import { buildPage } from './factories'

// Handlers padrão: API respondendo, mas sem ordens. Cada teste sobrescreve com server.use(...).
export const handlers = [http.get('/api/v1/orders', () => HttpResponse.json(buildPage([])))]
