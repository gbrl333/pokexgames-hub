'use client'

// Filtros reativos para o ranking: clã (chips coloridos) e range de level (US04)
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CLAN_NAMES, CLAN_COLORS } from '@/types/index'
import { cn } from '@/lib/utils'
import { SlidersHorizontal } from 'lucide-react'

interface LevelRange {
  min: number | null
  max: number | null
}

interface RankingFiltersProps {
  onClanChange: (clan: string | null) => void
  onLevelRangeChange: (range: LevelRange) => void
}

export function RankingFilters({ onClanChange, onLevelRangeChange }: RankingFiltersProps) {
  const [selectedClan, setSelectedClan] = useState<string>('all')
  const [minLevel, setMinLevel] = useState('')
  const [maxLevel, setMaxLevel] = useState('')

  function handleClanSelect(clan: string) {
    setSelectedClan(clan)
    onClanChange(clan === 'all' ? null : clan)
  }

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setMinLevel(val)
    onLevelRangeChange({
      min: val ? Number(val) : null,
      max: maxLevel ? Number(maxLevel) : null,
    })
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setMaxLevel(val)
    onLevelRangeChange({
      min: minLevel ? Number(minLevel) : null,
      max: val ? Number(val) : null,
    })
  }

  const clanOptions = ['all', ...CLAN_NAMES.filter((c) => c !== 'Nenhum')]

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal size={15} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Filtro de clã — chips */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Clã</Label>
          <div className="flex flex-wrap gap-1.5">
            {clanOptions.map((clan) => {
              const isAll = clan === 'all'
              const isActive = selectedClan === clan
              const clanColor = !isAll ? CLAN_COLORS[clan as keyof typeof CLAN_COLORS] : null

              return (
                <button
                  key={clan}
                  type="button"
                  onClick={() => handleClanSelect(clan)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                    isAll && isActive && 'border-primary/50 bg-primary/10 text-primary',
                    isAll && !isActive && 'border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-primary',
                    !isAll && isActive && clanColor && `${clanColor.bg} ${clanColor.text} ${clanColor.border}`,
                    !isAll && !isActive && 'border-border bg-secondary text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground'
                  )}
                >
                  {!isAll && clanColor && (
                    <span className={cn('h-1.5 w-1.5 rounded-full', clanColor.dot)} />
                  )}
                  {isAll ? 'Todos' : clan}
                </button>
              )
            })}
          </div>
        </div>

        {/* Level range */}
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="level-min" className="text-xs font-medium text-muted-foreground">
              Level mín.
            </Label>
            <Input
              id="level-min"
              type="number"
              min={1}
              placeholder="Mín"
              value={minLevel}
              onChange={handleMinChange}
              className="w-24 text-sm"
            />
          </div>
          <span className="mb-2 text-muted-foreground">–</span>
          <div className="space-y-1.5">
            <Label htmlFor="level-max" className="text-xs font-medium text-muted-foreground">
              Level máx.
            </Label>
            <Input
              id="level-max"
              type="number"
              min={1}
              placeholder="Máx"
              value={maxLevel}
              onChange={handleMaxChange}
              className="w-24 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
