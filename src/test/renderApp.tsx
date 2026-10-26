import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppProviders } from '../app/AppProviders'
import { AppRoutes } from '../app/router'

// Renderiza o app inteiro numa rota, com um QueryClient novo (sem cache entre testes e sem retentativas).
export function renderApp(route: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return {
    user: userEvent.setup(),
    ...render(
      <AppProviders queryClient={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      </AppProviders>,
    ),
  }
}
