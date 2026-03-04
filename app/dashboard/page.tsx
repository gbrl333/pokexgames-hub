'use client'

// Página de dashboard pessoal (US05) — métricas + gráfico de histórico
import { useHunts } from '@/hooks/useHunts'
import { StatsCard } from '@/app/components/dashboard/StatsCard'
import { HuntChart } from '@/app/components/dashboard/HuntChart'
import { formatGp } from '@/lib/huntCalculations'
import { Skeleton } from '@/components/ui/skeleton'

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
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
        Erro ao carregar dados: {error}
      </p>
    )
  }

  const totalHunts = hunts.length
  const avgGpPerHour = calcAvgGpPerHour(hunts)
  const totalNetProfit = hunts.reduce((sum, h) => sum + h.net_profit, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Meu Dashboard</h1>

      {/* Cards de métricas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total de Hunts"
          value={String(totalHunts)}
          icon="🎯"
          description="Todas as sessions registadas"
        />
        <StatsCard
          title="GP/h Médio"
          value={formatGp(avgGpPerHour)}
          icon="⚡"
          description="Média de todas as hunts"
          trend={avgGpPerHour >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Lucro Total"
          value={formatGp(totalNetProfit)}
          icon="💰"
          trend={totalNetProfit >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Gráfico das últimas 7 hunts */}
      <HuntChart hunts={lastSevenHunts} />
    </div>
  )
}
