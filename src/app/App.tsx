import { BrowserRouter } from 'react-router'
import { AppProviders } from './AppProviders'
import { createQueryClient } from './queryClient'
import { AppRoutes } from './router'

const queryClient = createQueryClient()

export function App() {
  return (
    <AppProviders queryClient={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  )
}
