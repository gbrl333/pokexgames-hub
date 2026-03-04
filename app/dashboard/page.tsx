'use client'

// Página de dashboard pessoal (US05) — métricas + gráficos
import { useHunts } from '@/hooks/useHunts'
import { StatsCard } from '@/app/components/dashboard/StatsCard'
import { HuntChart } from '@/app/components/dashboard/HuntChart'
import { formatGp } from '@/lib/huntCalculations'
import { Skeleton } from '@/components/ui/skeleton'
import { Target, Zap, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

function calcAvgGpPerHour(hunts: { net_profit: number; duration: number }[]): number {
  if (hunts.length === 0) return 0
  const totalGp = hunts.reduce((sum, h) => sum + h.net_profit, 0)
  const totalMinutes = hunts.reduce((sum, h) => sum + h.duration, 0)
  if (totalMinutes === 0) return 0
  return Math.round((totalGp / totalMinutes) * 60)
}

export default function DashboardPage() {
  const { hunts, lastSevenHunts, isLoading, error } = useHunts()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400">
        <AlertCircle size={16} />
        <span className="text-sm">Erro ao carregar dados: {error}</span>
      </div>
    )
  }

  const totalHunts = hunts.length
  const avgGpPerHour = calcAvgGpPerHour(hunts)
  const totalNetProfit = hunts.reduce((sum, h) => sum + h.net_profit, 0)
  const bestHunt = hunts.reduce(
    (best, h) => (h.net_profit > (best?.net_profit ?? -Infinity) ? h : best),
    null as (typeof hunts)[0] | null
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Meu Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo de todas as suas sessões de caça registadas.
        </p>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Hunts"
          value={String(totalHunts)}
          icon={Target}
          description="Sessions registadas"
          accentColor="blue"
        />
        <StatsCard
          title="GP/h Médio"
          value={formatGp(avgGpPerHour)}
          icon={Zap}
          description="Média de todas as hunts"
          trend={avgGpPerHour >= 0 ? 'up' : 'down'}
          accentColor="amber"
        />
        <StatsCard
          title="Lucro Total"
          value={formatGp(totalNetProfit)}
          icon={DollarSign}
          trend={totalNetProfit >= 0 ? 'up' : 'down'}
          description={totalNetProfit >= 0 ? 'Lucro acumulado' : 'Prejuízo acumulado'}
          accentColor={totalNetProfit >= 0 ? 'emerald' : 'rose'}
        />
        <StatsCard
          title="Melhor Hunt"
          value={bestHunt ? formatGp(bestHunt.net_profit) : '—'}
          icon={TrendingUp}
          description={bestHunt ? bestHunt.pokemon_target : 'Sem hunts ainda'}
          accentColor="purple"
        />
      </div>

      {/* Gráfico das últimas 7 hunts + acumulado */}
      <HuntChart hunts={lastSevenHunts} allHunts={hunts} />
    </div>
  )
}
