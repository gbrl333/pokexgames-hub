/**
 * Teste US05 — HuntChart
 * Verifica o gráfico de barras do histórico de hunts.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { HuntEntry } from '@/types/index'

import { HuntChart } from '@/app/components/dashboard/HuntChart'

const makeHunt = (overrides: Partial<HuntEntry> & { created_at: string }): HuntEntry => ({
  id: 'hunt-1',
  user_id: 'user-1',
  char_id: 'char-1',
  loot: 5_000_000,
  expenses: 2_000_000,
  net_profit: 3_000_000,
  duration: 60,
  pokemon_target: 'Dragonite',
  ...overrides,
})

const hunts = [
  makeHunt({ id: 'h1', net_profit: 3_000_000, created_at: '2025-01-10T00:00:00Z' }),
  makeHunt({ id: 'h2', net_profit: 2_000_000, created_at: '2025-01-09T00:00:00Z' }),
  makeHunt({ id: 'h3', net_profit: -500_000, created_at: '2025-01-08T00:00:00Z' }),
]

describe('HuntChart (US05 — AC: Gráfico de histórico de lucro)', () => {
  it('deve renderizar uma barra para cada hunt', () => {
    render(<HuntChart hunts={hunts} />)
    const bars = screen.getAllByRole('listitem')
    expect(bars.length).toBe(hunts.length)
  })

  it('deve mostrar empty state quando não há hunts', () => {
    render(<HuntChart hunts={[]} />)
    expect(screen.getByText(/nenhuma hunt|sem hunts|adicione/i)).toBeInTheDocument()
  })

  it('deve ter um título ou label de seção', () => {
    render(<HuntChart hunts={hunts} />)
    expect(screen.getByText(/histórico|lucro|hunt/i)).toBeInTheDocument()
  })

  it('deve diferenciar visualmente hunts com prejuízo (net_profit negativo)', () => {
    render(<HuntChart hunts={hunts} />)
    // A barra de prejuízo deve ter um atributo data-negative ou classe diferente
    const negativeBars = document.querySelectorAll('[data-negative="true"]')
    expect(negativeBars.length).toBe(1)
  })
})
