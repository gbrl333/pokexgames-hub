'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export function AuthGuard({ children }: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>('loading')

  useEffect(() => {
    const supabase = createClient()

    supabase.auth
      .getUser()
      .then(({ data: { user } }: { data: { user: User | null } }) => {
        setAuthState(user ? 'authenticated' : 'unauthenticated')
      })
      .catch(() => {
        setAuthState('unauthenticated')
      })
  }, [])

  if (authState === 'loading') {
    return (
      <div
        data-testid="auth-skeleton"
        aria-label="Carregando sessão"
        role="status"
        className="animate-pulse space-y-4 p-4"
      >
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
