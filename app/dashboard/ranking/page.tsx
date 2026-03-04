'use client'

// Página de ranking global (US04) — tabela filtrada com visual premium
import { useRanking } from '@/hooks/useRanking'
import { RankingTable } from '@/app/components/ranking/RankingTable'
import { RankingFilters } from '@/app/components/ranking/RankingFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, AlertCircle } from 'lucide-react'

export default function RankingPage() {
  const { filteredData, isLoading, error, setClanFilter, setLevelRange } = useRanking()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Ranking Global
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Melhores combinações de Pokémon por GP/hora da comunidade.
        </p>
      </div>

      {/* Stats rápidas */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <Trophy size={16} className="text-amber-400" />
            <div>
              <p className="text-xs text-muted-foreground">Top Pokémon</p>
              <p className="text-sm font-semibold text-foreground">
                {filteredData[0]?.pokemon_target ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Melhor GP/h</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {filteredData[0]?.avg_gp_per_hour
                  ? `${Math.round(filteredData[0].avg_gp_per_hour / 1000)}k/h`
                  : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="text-sm font-semibold text-foreground">{filteredData.length} combinações</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <RankingFilters
        onClanChange={setClanFilter}
        onLevelRangeChange={setLevelRange}
      />

      {/* Tabela */}
      {isLoading && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          Erro ao carregar ranking: {error}
        </div>
      )}

      {!isLoading && !error && <RankingTable data={filteredData} />}
    </div>
  )
}
