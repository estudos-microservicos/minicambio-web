import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { LiveAnnouncer } from '../shared/components/LiveAnnouncer'

type AppProvidersProps = {
  queryClient: QueryClient
  children: ReactNode
}

export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LiveAnnouncer>{children}</LiveAnnouncer>
    </QueryClientProvider>
  )
}
