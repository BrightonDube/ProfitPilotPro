'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'

function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize)
  const status = useAuthStore((state) => state.status)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (status === 'idle' && !hasInitialized.current) {
      hasInitialized.current = true
      initialize().catch(() => {
        // errors handled inside the store
      })
    }
  }, [initialize, status])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
    []
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  )
}
