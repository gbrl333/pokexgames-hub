'use client'

// Hook para hunts: usa Supabase quando logado, estado local quando não logado (US05)
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HuntEntry } from '@/types/index'
import { getLastNHunts } from '@/lib/rankingHelpers'

interface UseHuntsResult {
  hunts: HuntEntry[]
  lastSevenHunts: HuntEntry[]
  isLoading: boolean
  error: string | null
  addLocalHunt: (hunt: HuntEntry) => void
  refetch: () => void
}

export function useHunts(): UseHuntsResult {
  const [hunts, setHunts] = useState<HuntEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchHunts() {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Sem login: mantém estado local, apenas termina o loading
        if (!cancelled) {
          setIsLoggedIn(false)
          setIsLoading(false)
        }
        return
      }

      setIsLoggedIn(true)

      const { data, error: fetchError } = await supabase
        .from('hunts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!cancelled) {
        if (fetchError) {
          setError(fetchError.message)
        } else {
          setHunts((data as HuntEntry[]) ?? [])
        }
        setIsLoading(false)
      }
    }

    fetchHunts()

    return () => { cancelled = true }
  }, [tick])

  // Usado pela página de hunt para adicionar ao estado local sem login
  const addLocalHunt = useCallback((hunt: HuntEntry) => {
    if (!isLoggedIn) {
      setHunts((prev) => [hunt, ...prev])
    }
  }, [isLoggedIn])

  function refetch() {
    setTick((t) => t + 1)
  }

  const lastSevenHunts = getLastNHunts(hunts, 7)

  return { hunts, lastSevenHunts, isLoading, error, addLocalHunt, refetch }
}
