// Gráfico de barras CSS para o histórico de lucro (US05)
// Não usa library externa — barras proporcionais via Tailwind
import type { HuntEntry } from '@/types/index'
import { formatGp } from '@/lib/huntCalculations'

interface HuntChartProps {
  hunts: HuntEntry[]
}

export function HuntChart({ hunts }: HuntChartProps) {
  if (hunts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Nenhuma hunt registada ainda</p>
      </div>
    )
  }

  const maxAbs = Math.max(...hunts.map((h) => Math.abs(h.net_profit)), 1)

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
        Histórico de Lucro
      </h3>
      <ul className="flex items-end gap-2" style={{ height: '120px' }}>
        {hunts.map((hunt) => {
          const isNegative = hunt.net_profit < 0
          const heightPct = (Math.abs(hunt.net_profit) / maxAbs) * 100
          return (
            <li
              key={hunt.id}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: '100%' }}
              data-negative={isNegative ? 'true' : 'false'}
            >
              {/* Tooltip */}
              <span className="absolute -top-6 hidden whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-xs text-background group-hover:block">
                {formatGp(hunt.net_profit)}
              </span>
              {/* Barra */}
              <div
                className={`w-full rounded-t transition-all ${isNegative ? 'bg-red-400' : 'bg-emerald-500'}`}
                style={{ height: `${heightPct}%` }}
                aria-label={`Hunt: ${formatGp(hunt.net_profit)}`}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
