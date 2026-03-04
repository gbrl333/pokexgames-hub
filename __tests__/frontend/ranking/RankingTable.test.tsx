/**
 * Teste US04 — RankingTable
 * Verifica a tabela de ranking: renderização, ordenação por colunas.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RankingTable } from '@/app/components/ranking/RankingTable'

const rankingData = [
  { pokemon_target: 'Dragonite', clan: 'Impulso', avg_gp_per_hour: 3_000_000, total_hunts: 10, min_level: 400, max_level: 600 },
  { pokemon_target: 'Alakazam', clan: 'Elemento', avg_gp_per_hour: 5_000_000, total_hunts: 5, min_level: 300, max_level: 500 },
  { pokemon_target: 'Mewtwo', clan: 'Impulso', avg_gp_per_hour: 8_000_000, total_hunts: 3, min_level: 700, max_level: 1000 },
]

describe('RankingTable (US04 — AC: Tabela com sort)', () => {
  describe('Renderização', () => {
    it('deve renderizar todas as linhas de dados', () => {
      render(<RankingTable data={rankingData} />)
      expect(screen.getByText('Dragonite')).toBeInTheDocument()
      expect(screen.getByText('Alakazam')).toBeInTheDocument()
      expect(screen.getByText('Mewtwo')).toBeInTheDocument()
    })

    it('deve renderizar os cabeçalhos da tabela', () => {
      render(<RankingTable data={rankingData} />)
      expect(screen.getByText(/pok[ée]mon/i)).toBeInTheDocument()
      expect(screen.getByText(/gp\/h|gp.h/i)).toBeInTheDocument()
      expect(screen.getByText(/cl[ãa]/i)).toBeInTheDocument()
    })

    it('deve formatar GP/h com sufixo kk ou k', () => {
      render(<RankingTable data={rankingData} />)
      // 3.000.000 → "3kk", 5.000.000 → "5kk", 8.000.000 → "8kk" (with + prefix for positive)
      expect(screen.getByText('+3kk')).toBeInTheDocument()
      expect(screen.getByText('+5kk')).toBeInTheDocument()
      expect(screen.getByText('+8kk')).toBeInTheDocument()
    })

    it('deve mostrar empty state quando não há dados', () => {
      render(<RankingTable data={[]} />)
      expect(screen.getByText(/nenhum|sem dados|vazio/i)).toBeInTheDocument()
    })
  })

  describe('Ordenação (Sort)', () => {
    it('deve ordenar por GP/h ao clicar no cabeçalho', async () => {
      const user = userEvent.setup()
      render(<RankingTable data={rankingData} />)

      const gpHeader = screen.getByRole('button', { name: /gp\/h|gp.h/i })
      await user.click(gpHeader)

      const rows = screen.getAllByRole('row')
      // Default is desc (Mewtwo first), clicking once switches to asc → Dragonite (3kk) first
      expect(rows[1].textContent).toContain('Dragonite')
    })

    it('deve ordenar por Pokémon ao clicar no cabeçalho', async () => {
      const user = userEvent.setup()
      render(<RankingTable data={rankingData} />)

      const pokemonHeader = screen.getByRole('button', { name: /pok[ée]mon/i })
      await user.click(pokemonHeader)

      const rows = screen.getAllByRole('row')
      // Ordem alfabética: Alakazam, Dragonite, Mewtwo
      expect(rows[1].textContent).toContain('Alakazam')
    })
  })
})
