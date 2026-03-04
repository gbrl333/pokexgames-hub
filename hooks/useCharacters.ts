'use client'

// Hook para personagens: usa Supabase quando logado, estado local quando não logado (US02)
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Character } from '@/types/index'

interface UseCharactersResult {
  characters: Character[]
  isLoading: boolean
  error: string | null
  addLocalCharacter: (char: Character) => void
  refetch: () => void
}

export function useCharacters(): UseCharactersResult {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchCharacters() {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Sem login: mantém o estado local existente, apenas termina o loading
        if (!cancelled) {
          setIsLoggedIn(false)
          setIsLoading(false)
        }
        return
      }

      setIsLoggedIn(true)

      const { data, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!cancelled) {
        if (fetchError) {
          setError(fetchError.message)
        } else {
          setCharacters((data as Character[]) ?? [])
        }
        setIsLoading(false)
      }
    }

    fetchCharacters()

    return () => { cancelled = true }
  }, [tick])

  // Usado pelas páginas para adicionar ao estado local sem login
  const addLocalCharacter = useCallback((char: Character) => {
    if (!isLoggedIn) {
      setCharacters((prev) => [char, ...prev])
    }
  }, [isLoggedIn])

  function refetch() {
    setTick((t) => t + 1)
  }

  return { characters, isLoading, error, addLocalCharacter, refetch }
}
