'use client'

// Gráfico de área com Recharts para o histórico de hunts (US05)
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import type { HuntEntry } from '@/types/index'
import { formatGp } from '@/lib/huntCalculations'
import { TrendingUp, BarChart2 } from 'lucide-react'
import { useState } from 'react'

interface HuntChartProps {
  hunts: HuntEntry[]
  allHunts?: HuntEntry[]
}

interface TooltipPayload {
  value: number
  name: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value ?? 0
  const isPositive = value >= 0

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {formatGp(value)}
      </p>
    </div>
  )
}

function formatXAxis(hunt: HuntEntry, index: number) {
  const date = new Date(hunt.created_at)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

export function HuntChart({ hunts, allHunts = [] }: HuntChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  if (hunts.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card">
        <BarChart2 size={32} className="text-muted-foreground/40" />
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Nenhuma hunt registada ainda</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Registe a sua primeira hunt para ver os gráficos
          </p>
        </div>
      </div>
    )
  }

  const chartData = hunts.map((hunt, i) => ({
    name: formatXAxis(hunt, i),
    pokemon: hunt.pokemon_target,
    profit: hunt.net_profit,
    duration: hunt.duration,
  }))

  // Pokémon mais caçado
  const pokemonCounts = allHunts.reduce<Record<string, number>>((acc, h) => {
    acc[h.pokemon_target] = (acc[h.pokemon_target] ?? 0) + 1
    return acc
  }, {})
  const favoritePokemon = Object.entries(pokemonCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  // Acumulado
  let running = 0
  const accumulatedData = allHunts.slice(-14).map((hunt) => {
    running += hunt.net_profit
    return {
      name: new Date(hunt.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      acumulado: running,
    }
  })

  return (
    <div className="space-y-4">
      {/* Chart principal */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        {/* Header do chart */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Histórico de Lucro</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Últimas {hunts.length} hunt{hunts.length !== 1 ? 's' : ''} registadas
            </p>
          </div>
          <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Área
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Barras
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatGp(v)}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" strokeWidth={1.5} />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#profitGradient)"
                dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatGp(v)}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
              <Bar dataKey="profit" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.profit >= 0 ? '#10b981' : '#ef4444'}
                    opacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart de acumulado (só aparece com 2+ hunts) */}
      {accumulatedData.length >= 2 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Lucro Acumulado</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Evolução do lucro total ao longo das últimas {accumulatedData.length} hunts
              </p>
            </div>
            {favoritePokemon && (
              <div className="ml-auto rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                Favorito: <span className="font-medium text-foreground">{favoritePokemon}</span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={accumulatedData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="accumGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatGp(v)}
                width={55}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                      <p className={`text-sm font-bold ${(payload[0]?.value ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatGp(payload[0]?.value as number ?? 0)}
                      </p>
                    </div>
                  ) : null
                }
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="acumulado"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#accumGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
