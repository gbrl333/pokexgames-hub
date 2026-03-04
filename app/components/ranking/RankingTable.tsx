'use client'

// Tabela de ranking global com sort por coluna (US04)
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

/** Formata GP/h: ≥1_000_000 → Xkk, ≥1_000 → Xk, senão número inteiro */
function formatGpH(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}kk`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}

export function RankingTable({ data }: RankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_gp_per_hour')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      // Segunda vez no mesmo campo: toggle
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      // Campos de texto: asc natural (A-Z); campos numéricos: desc (maior primeiro)
      setSortDir(key === 'pokemon_target' ? 'asc' : 'desc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              type="button"
              onClick={() => handleSort('pokemon_target')}
              className="font-semibold hover:underline"
            >
              Pokémon
            </button>
          </TableHead>
          <TableHead>Clã</TableHead>
          <TableHead>
            <button
              type="button"
              onClick={() => handleSort('avg_gp_per_hour')}
              className="font-semibold hover:underline"
            >
              GP/h
            </button>
          </TableHead>
          <TableHead>
            <button
              type="button"
              onClick={() => handleSort('total_hunts')}
              className="font-semibold hover:underline"
            >
              Hunts
            </button>
          </TableHead>
          <TableHead>Level</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row, idx) => (
          <TableRow key={`${row.pokemon_target}-${row.clan}-${idx}`}>
            <TableCell>{row.pokemon_target}</TableCell>
            <TableCell>{row.clan}</TableCell>
            <TableCell>{formatGpH(row.avg_gp_per_hour)}</TableCell>
            <TableCell>{row.total_hunts}</TableCell>
            <TableCell>
              {row.min_level}–{row.max_level}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
