'use client'

// Filtros reativos para o ranking: clã e range de level (US04)
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CLAN_NAMES } from '@/types/index'

interface LevelRange {
  min: number | null
  max: number | null
}

interface RankingFiltersProps {
  onClanChange: (clan: string | null) => void
  onLevelRangeChange: (range: LevelRange) => void
}

export function RankingFilters({ onClanChange, onLevelRangeChange }: RankingFiltersProps) {
  const [minLevel, setMinLevel] = useState('')
  const [maxLevel, setMaxLevel] = useState('')

  function handleClanChange(value: string) {
    // "all" representa "Todos os clãs" (sem filtro)
    onClanChange(value === 'all' ? null : value)
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

  return (
    <div className="flex flex-wrap gap-4">
      {/* Filtro de clã */}
      <div className="space-y-1.5">
        <Label>Clã</Label>
        <Select defaultValue="all" onValueChange={handleClanChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clãs</SelectItem>
            {CLAN_NAMES.filter((c) => c !== 'Nenhum').map((clan) => (
              <SelectItem key={clan} value={clan}>
                {clan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de level mínimo */}
      <div className="space-y-1.5">
        <Label htmlFor="level-min">Level mín.</Label>
        <Input
          id="level-min"
          type="number"
          min={1}
          placeholder="Mín"
          value={minLevel}
          onChange={handleMinChange}
          className="w-24"
        />
      </div>

      {/* Filtro de level máximo */}
      <div className="space-y-1.5">
        <Label htmlFor="level-max">Level máx.</Label>
        <Input
          id="level-max"
          type="number"
          min={1}
          placeholder="Máx"
          value={maxLevel}
          onChange={handleMaxChange}
          className="w-24"
        />
      </div>
    </div>
  )
}
