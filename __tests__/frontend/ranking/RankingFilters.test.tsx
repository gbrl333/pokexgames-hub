/**
 * Teste US04 — RankingFilters
 * Verifica os filtros reativos de clã e range de level.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RankingFilters } from '@/app/components/ranking/RankingFilters'

describe('RankingFilters (US04 — AC: Filtros reativos)', () => {
  describe('Filtro de clã', () => {
    it('deve renderizar o select de clã', () => {
      render(<RankingFilters onClanChange={vi.fn()} onLevelRangeChange={vi.fn()} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('deve chamar onClanChange ao selecionar um clã', async () => {
      const user = userEvent.setup()
      const onClanChange = vi.fn()
      render(<RankingFilters onClanChange={onClanChange} onLevelRangeChange={vi.fn()} />)

      const combobox = screen.getByRole('combobox')
      await user.click(combobox)
      await user.click(screen.getByText('Impulso'))

      expect(onClanChange).toHaveBeenCalledWith('Impulso')
    })

    it('deve ter opção "Todos os clãs" para remover o filtro', () => {
      render(<RankingFilters onClanChange={vi.fn()} onLevelRangeChange={vi.fn()} />)
      // Abre o select para ver as opções
      expect(screen.getByText(/todos|all/i)).toBeInTheDocument()
    })
  })

  describe('Filtro de range de level', () => {
    it('deve renderizar os campos de level mínimo e máximo', () => {
      render(<RankingFilters onClanChange={vi.fn()} onLevelRangeChange={vi.fn()} />)
      expect(screen.getByPlaceholderText(/m[ií]n/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/m[áa]x/i)).toBeInTheDocument()
    })

    it('deve chamar onLevelRangeChange ao alterar o level mínimo', async () => {
      const user = userEvent.setup()
      const onLevelRangeChange = vi.fn()
      render(<RankingFilters onClanChange={vi.fn()} onLevelRangeChange={onLevelRangeChange} />)

      await user.type(screen.getByPlaceholderText(/m[ií]n/i), '300')

      await waitFor(() => {
        expect(onLevelRangeChange).toHaveBeenCalled()
      })
    })
  })
})
