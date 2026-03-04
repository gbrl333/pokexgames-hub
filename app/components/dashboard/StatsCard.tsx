// Card de métrica para o dashboard pessoal (US05)
interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-green-600'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground'

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`mt-2 text-3xl font-bold ${trendColor}`}>{value}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
