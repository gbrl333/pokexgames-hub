// Card de métrica premium para o dashboard pessoal
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  /** Cor de destaque do card — classe Tailwind */
  accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
}

const ACCENT_MAP = {
  blue:    { iconBg: 'bg-blue-500/10',    iconText: 'text-blue-500',    bar: 'bg-blue-500' },
  emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-500', bar: 'bg-emerald-500' },
  amber:   { iconBg: 'bg-amber-500/10',   iconText: 'text-amber-500',   bar: 'bg-amber-500' },
  rose:    { iconBg: 'bg-rose-500/10',    iconText: 'text-rose-500',    bar: 'bg-rose-500' },
  purple:  { iconBg: 'bg-purple-500/10',  iconText: 'text-purple-500',  bar: 'bg-purple-500' },
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon = BarChart2,
  trend,
  trendValue,
  accentColor = 'blue',
}: StatsCardProps) {
  const accent = ACCENT_MAP[accentColor]

  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-red-500 dark:text-red-400'
        : 'text-muted-foreground'

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
      {/* Barra de cor no topo */}
      <div className={cn('absolute inset-x-0 top-0 h-0.5', accent.bar)} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {(description || trendValue) && (
            <div className="mt-2 flex items-center gap-1.5">
              {trend && (
                <TrendIcon size={13} className={trendColor} />
              )}
              {trendValue && (
                <span className={cn('text-xs font-medium', trendColor)}>
                  {trendValue}
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-2.5 transition-colors', accent.iconBg)}>
          <Icon size={20} className={accent.iconText} />
        </div>
      </div>
    </div>
  )
}
