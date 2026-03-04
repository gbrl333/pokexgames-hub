'use client'

// Página de ranking global (US04) — tabela filtrada por clã e level
import { useRanking } from '@/hooks/useRanking'
import { RankingTable } from '@/app/components/ranking/RankingTable'
import { RankingFilters } from '@/app/components/ranking/RankingFilters'
import { Skeleton } from '@/components/ui/skeleton'

export default function RankingPage() {
  const { filteredData, isLoading, error, setClanFilter, setLevelRange } = useRanking()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Ranking Global</h1>

      {/* Filtros */}
      <RankingFilters
        onClanChange={setClanFilter}
        onLevelRangeChange={setLevelRange}
      />

      {/* Tabela */}
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
          Erro ao carregar ranking: {error}
        </p>
      )}

      {!isLoading && !error && <RankingTable data={filteredData} />}
    </div>
  )
}
