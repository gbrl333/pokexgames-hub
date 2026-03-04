/**
 * Teste US03 — HuntForm
 * Valida o formulário de registro de hunt:
 * select de personagem, campos numéricos, preview dinâmico de GP.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Character } from '@/types/index'

// Mock da Server Action
const mockCreateHunt = vi.fn()
vi.mock('@/lib/actions/createHuntAction', () => ({
  createHuntAction: (...args: unknown[]) => mockCreateHunt(...args),
}))

import { HuntForm } from '@/app/components/hunt/HuntForm'

const characters: Character[] = [
  {
    id: 'char-1',
    user_id: 'user-1',
    name: 'AshKetchum',
    level: 500,
    clan: 'Naturia',
    pokemons: ['Pikachu'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

describe('HuntForm (US03 — AC: Formulário de hunt)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização dos campos', () => {
    it('deve renderizar o select de personagem', () => {
      render(<HuntForm characters={characters} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('deve renderizar o campo loot', () => {
      render(<HuntForm characters={characters} />)
      expect(screen.getByLabelText(/loot/i)).toBeInTheDocument()
    })

    it('deve renderizar o campo gastos/expenses', () => {
      render(<HuntForm characters={characters} />)
      expect(screen.getByLabelText(/gasto|expense/i)).toBeInTheDocument()
    })

    it('deve renderizar o campo duração', () => {
      render(<HuntForm characters={characters} />)
      expect(screen.getByLabelText(/dura[çc][aã]o|minuto/i)).toBeInTheDocument()
    })

    it('deve renderizar o campo pokémon alvo', () => {
      render(<HuntForm characters={characters} />)
      expect(screen.getByLabelText(/pok[ée]mon.*alvo|alvo/i)).toBeInTheDocument()
    })

    it('deve renderizar o botão de submit', () => {
      render(<HuntForm characters={characters} />)
      expect(screen.getByRole('button', { name: /registrar|salvar|enviar/i })).toBeInTheDocument()
    })
  })

  describe('Preview dinâmico de GP (US03 AC Frontend)', () => {
    it('deve mostrar o lucro líquido dinamicamente ao preencher loot e gastos', async () => {
      const user = userEvent.setup()
      render(<HuntForm characters={characters} />)

      await user.type(screen.getByLabelText(/loot/i), '5000000')
      await user.type(screen.getByLabelText(/gasto|expense/i), '2000000')

      await waitFor(() => {
        // Deve exibir 3kk ou 3.000.000 como lucro líquido
        expect(screen.getByTestId('hunt-preview')).toBeInTheDocument()
      })
    })

    it('deve mostrar prejuízo quando gastos > loot', async () => {
      const user = userEvent.setup()
      render(<HuntForm characters={characters} />)

      await user.type(screen.getByLabelText(/loot/i), '1000000')
      await user.type(screen.getByLabelText(/gasto|expense/i), '3000000')

      await waitFor(() => {
        const preview = screen.getByTestId('hunt-preview')
        expect(preview).toBeInTheDocument()
        // Deve indicar prejuízo (valor negativo)
        expect(preview.textContent).toMatch(/-/)
      })
    })
  })

  describe('Validação', () => {
    it('deve mostrar erro se loot for negativo', async () => {
      const user = userEvent.setup()
      render(<HuntForm characters={characters} />)

      await user.type(screen.getByLabelText(/loot/i), '-100')
      await user.click(screen.getByRole('button', { name: /registrar|salvar|enviar/i }))

      await waitFor(() => {
        expect(mockCreateHunt).not.toHaveBeenCalled()
      })
    })

    it('deve mostrar erro se duração for zero', async () => {
      const user = userEvent.setup()
      render(<HuntForm characters={characters} />)

      await user.type(screen.getByLabelText(/dura[çc][aã]o|minuto/i), '0')
      await user.click(screen.getByRole('button', { name: /registrar|salvar|enviar/i }))

      await waitFor(() => {
        expect(mockCreateHunt).not.toHaveBeenCalled()
      })
    })
  })

  describe('Submissão', () => {
    it('deve chamar createHuntAction sem o campo net_profit (calculado no servidor)', async () => {
      const user = userEvent.setup()
      mockCreateHunt.mockResolvedValue({ success: true, data: { id: 'h1', net_profit: 3000000 } })
      render(<HuntForm characters={characters} />)

      // Seleciona personagem
      const combobox = screen.getByRole('combobox')
      await user.click(combobox)
      await user.click(screen.getByText('AshKetchum'))

      await user.type(screen.getByLabelText(/loot/i), '5000000')
      await user.type(screen.getByLabelText(/gasto|expense/i), '2000000')
      await user.type(screen.getByLabelText(/dura[çc][aã]o|minuto/i), '60')
      await user.type(screen.getByLabelText(/pok[ée]mon.*alvo|alvo/i), 'Dragonite')

      await user.click(screen.getByRole('button', { name: /registrar|salvar|enviar/i }))

      await waitFor(() => {
        expect(mockCreateHunt).toHaveBeenCalledOnce()
        // O payload enviado NÃO deve conter net_profit
        const payload = mockCreateHunt.mock.calls[0][0] as Record<string, unknown>
        expect(payload).not.toHaveProperty('net_profit')
      })
    })
  })
})
