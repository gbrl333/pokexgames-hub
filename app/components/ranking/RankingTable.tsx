'use client'

// Tabela de ranking global com sort, medalhas e visual premium (US04)
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CLAN_COLORS } from '@/types/index'
import type { ClanName } from '@/types/index'
import { ArrowUpDown, ArrowUp, ArrowDown, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RankingRow {
  pokemon_target: string
  clan: string
  avg_gp_per_hour: number
  total_hunts: number
  min_level: number
  max_level: number
}

interface RankingTableProps {
  data: RankingRow[]
}

type SortKey = 'pokemon_target' | 'avg_gp_per_hour' | 'total_hunts'
type SortDir = 'asc' | 'desc'

function formatGpH(value: number): string {
  if (value >= 1_000_000) {
    const n = value / 1_000_000
    return `${Number.isInteger(n) ? n : n.toFixed(1)}kk`
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}

const MEDAL_CLASSES = [
  'text-amber-400', // 🥇
  'text-slate-400', // 🥈
  'text-amber-700', // 🥉
]

function SortIcon({ sortKey, currentKey, dir }: { sortKey: SortKey; currentKey: SortKey; dir: SortDir }) {
  if (sortKey !== currentKey) return <ArrowUpDown size={13} className="ml-1 text-muted-foreground/50" />
  return dir === 'asc'
    ? <ArrowUp size={13} className="ml-1 text-primary" />
    : <ArrowDown size={13} className="ml-1 text-primary" />
}

export function RankingTable({ data }: RankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_gp_per_hour')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'pokemon_target' ? 'asc' : 'desc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  if (data.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50">
        <Trophy size={28} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="w-10 text-center text-xs">#</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('pokemon_target')}
                className="flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Pokémon
                <SortIcon sortKey="pokemon_target" currentKey={sortKey} dir={sortDir} />
              </button>
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Clã</TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('avg_gp_per_hour')}
                className="flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                GP/h Médio
                <SortIcon sortKey="avg_gp_per_hour" currentKey={sortKey} dir={sortDir} />
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('total_hunts')}
                className="flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Hunts
                <SortIcon sortKey="total_hunts" currentKey={sortKey} dir={sortDir} />
              </button>
            </TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground">Levels</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row, idx) => {
            const clanColor = CLAN_COLORS[row.clan as ClanName] ?? CLAN_COLORS['Nenhum']
            const isTop3 = idx < 3
            const isPositive = row.avg_gp_per_hour >= 0

            return (
              <TableRow
                key={`${row.pokemon_target}-${row.clan}-${idx}`}
                className={cn(
                  'border-border transition-colors',
                  isTop3 && idx === 0 && 'bg-amber-500/5 hover:bg-amber-500/10',
                  isTop3 && idx === 1 && 'bg-slate-500/5 hover:bg-slate-500/10',
                  isTop3 && idx === 2 && 'bg-amber-700/5 hover:bg-amber-700/10',
                )}
              >
                {/* Posição */}
                <TableCell className="text-center">
                  {isTop3 ? (
                    <Trophy size={14} className={cn('mx-auto', MEDAL_CLASSES[idx])} />
                  ) : (
                    <span className="text-xs text-muted-foreground">{idx + 1}</span>
                  )}
                </TableCell>

                {/* Pokémon */}
                <TableCell>
                  <span className="font-medium text-foreground">{row.pokemon_target}</span>
                </TableCell>

                {/* Clã */}
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      clanColor.bg, clanColor.text, clanColor.border
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', clanColor.dot)} />
                    {row.clan}
                  </span>
                </TableCell>

                {/* GP/h */}
                <TableCell>
                  <span className={cn('font-bold', isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                    {isPositive ? '+' : ''}{formatGpH(row.avg_gp_per_hour)}
                  </span>
                </TableCell>

                {/* Hunts */}
                <TableCell>
                  <span className="text-sm text-muted-foreground">{row.total_hunts}</span>
                </TableCell>

                {/* Levels */}
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {row.min_level}–{row.max_level}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
