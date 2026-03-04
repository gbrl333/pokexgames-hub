'use client'

// Hook para buscar dados do ranking global e aplicar filtros client-side (US04)
// Lê da view v_global_stats no Supabase
import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { filterByClan, filterByLevelRange } from '@/lib/rankingHelpers'

export interface RankingRow {
  pokemon_target: string
  clan: string
  avg_gp_per_hour: number
  total_hunts: number
  min_level: number
  max_level: number
}

interface LevelRange {
  min: number | null
  max: number | null
}

interface UseRankingResult {
  data: RankingRow[]
  filteredData: RankingRow[]
  isLoading: boolean
  error: string | null
  setClanFilter: (clan: string | null) => void
  setLevelRange: (range: LevelRange) => void
  refetch: () => void
}

export function useRanking(): UseRankingResult {
  const [data, setData] = useState<RankingRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [clanFilter, setClanFilter] = useState<string | null>(null)
  const [levelRange, setLevelRange] = useState<LevelRange>({ min: null, max: null })

  useEffect(() => {
    let cancelled = false

    async function fetchRanking() {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      const { data: rows, error: fetchError } = await supabase
        .from('v_global_stats')
        .select('pokemon_target, clan, avg_gp_per_hour, total_hunts, min_level, max_level')
        .order('avg_gp_per_hour', { ascending: false })

      if (!cancelled) {
        if (fetchError) {
          setError(fetchError.message)
        } else {
          setData((rows as RankingRow[]) ?? [])
        }
        setIsLoading(false)
      }
    }

    fetchRanking()

    return () => {
      cancelled = true
    }
  }, [tick])

  function refetch() {
    setTick((t) => t + 1)
  }

  // Filtros aplicados client-side
  const filteredData = useMemo<RankingRow[]>(() => {
    // Os helpers de rankingHelpers usam tipos genéricos com index signature;
    // usamos unknown como intermediário para evitar erros de conversão
    type GenericClanRow = { clan: string; [key: string]: unknown }
    type GenericLevelRow = { min_level?: number; max_level?: number; [key: string]: unknown }

    let result = filterByClan(
      data as unknown as GenericClanRow[],
      clanFilter,
    ) as unknown as RankingRow[]

    if (levelRange.min !== null || levelRange.max !== null) {
      result = filterByLevelRange(
        result as unknown as GenericLevelRow[],
        levelRange.min ?? 0,
        levelRange.max ?? 10000,
      ) as unknown as RankingRow[]
    }

    return result
  }, [data, clanFilter, levelRange])

  return {
    data,
    filteredData,
    isLoading,
    error,
    setClanFilter,
    setLevelRange,
    refetch,
  }
}
