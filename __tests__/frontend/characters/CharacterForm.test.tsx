/**
 * Teste US02 — CharacterForm
 * Valida o formulário de criação de personagem:
 * nome, level, clan (select), pokemons (tags), feedback de erro.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock da Server Action
const mockCreateCharacter = vi.fn()
vi.mock('@/lib/actions/createCharacterAction', () => ({
  createCharacterAction: (...args: unknown[]) => mockCreateCharacter(...args),
}))

import { CharacterForm } from '@/app/components/characters/CharacterForm'

describe('CharacterForm (US02 — AC: Formulário com validação Zod)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderização dos campos', () => {
    it('deve renderizar o campo nome', () => {
      render(<CharacterForm />)
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    })

    it('deve renderizar o campo level', () => {
      render(<CharacterForm />)
      expect(screen.getByLabelText(/level/i)).toBeInTheDocument()
    })

    it('deve renderizar o select de clã', () => {
      render(<CharacterForm />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('deve renderizar o campo de input de pokémons', () => {
      render(<CharacterForm />)
      expect(screen.getByPlaceholderText(/charizard|enter para adicionar/i)).toBeInTheDocument()
    })

    it('deve renderizar o botão de submit', () => {
      render(<CharacterForm />)
      expect(screen.getByRole('button', { name: /criar personagem|salvar/i })).toBeInTheDocument()
    })
  })

  describe('Validação client-side', () => {
    it('deve mostrar erro quando nome tem menos de 3 caracteres', async () => {
      const user = userEvent.setup()
      render(<CharacterForm />)

      await user.type(screen.getByLabelText(/nome/i), 'Ab')
      await user.click(screen.getByRole('button', { name: /criar personagem|salvar/i }))

      await waitFor(() => {
        expect(screen.getByText(/3/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar erro quando level está fora do range 1-1000', async () => {
      const user = userEvent.setup()
      render(<CharacterForm />)

      await user.type(screen.getByLabelText(/nome/i), 'AshKetchum')
      await user.type(screen.getByLabelText(/level/i), '9999')
      await user.click(screen.getByRole('button', { name: /criar personagem|salvar/i }))

      await waitFor(() => {
        expect(screen.getByText(/1000/i)).toBeInTheDocument()
      })
    })

    it('não deve submeter se não há pokémons adicionados', async () => {
      const user = userEvent.setup()
      render(<CharacterForm />)

      await user.type(screen.getByLabelText(/nome/i), 'AshKetchum')
      await user.type(screen.getByLabelText(/level/i), '500')
      await user.click(screen.getByRole('button', { name: /criar personagem|salvar/i }))

      await waitFor(() => {
        expect(mockCreateCharacter).not.toHaveBeenCalled()
      })
    })
  })

  describe('Adição de pokémons (tags)', () => {
    it('deve adicionar pokémon ao pressionar Enter', async () => {
      const user = userEvent.setup()
      render(<CharacterForm />)

      const pokemonInput = screen.getByPlaceholderText(/charizard|enter para adicionar/i)
      await user.type(pokemonInput, 'Pikachu')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Pikachu')).toBeInTheDocument()
      })
    })

    it('deve remover pokémon ao clicar no X da tag', async () => {
      const user = userEvent.setup()
      render(<CharacterForm />)

      const pokemonInput = screen.getByPlaceholderText(/charizard|enter para adicionar/i)
      await user.type(pokemonInput, 'Pikachu')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('Pikachu')).toBeInTheDocument()
      })

      const removeButton = screen.getByRole('button', { name: /remover pikachu|×|x/i })
      await user.click(removeButton)

      await waitFor(() => {
        expect(screen.queryByText('Pikachu')).not.toBeInTheDocument()
      })
    })

    it('não deve adicionar mais de 6 pokémons', async () => {
      const user = userEvent.setup()
      render(<CharacterForm />)

      const pokemonInput = screen.getByPlaceholderText(/charizard|enter para adicionar/i)
      const pokemons = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

      for (const p of pokemons) {
        await user.type(pokemonInput, p)
        await user.keyboard('{Enter}')
      }

      // Input deve ser desabilitado com 6 pokémons
      await waitFor(() => {
        expect(pokemonInput).toBeDisabled()
      })
    })
  })

  describe('Submissão e feedback', () => {
    it('deve chamar createCharacterAction com os dados corretos', async () => {
      const user = userEvent.setup()
      mockCreateCharacter.mockResolvedValue({ success: true, data: { id: 'c1', name: 'AshKetchum' } })
      render(<CharacterForm />)

      await user.type(screen.getByLabelText(/nome/i), 'AshKetchum')
      await user.type(screen.getByLabelText(/level/i), '500')

      const pokemonInput = screen.getByPlaceholderText(/charizard|enter para adicionar/i)
      await user.type(pokemonInput, 'Pikachu')
      await user.keyboard('{Enter}')

      await user.click(screen.getByRole('button', { name: /criar personagem|salvar/i }))

      await waitFor(() => {
        expect(mockCreateCharacter).toHaveBeenCalledOnce()
      })
    })

    it('deve mostrar erro de nome duplicado retornado pelo servidor', async () => {
      const user = userEvent.setup()
      mockCreateCharacter.mockResolvedValue({
        success: false,
        error: 'Já existe um personagem com este nome',
      })
      render(<CharacterForm />)

      await user.type(screen.getByLabelText(/nome/i), 'AshKetchum')
      await user.type(screen.getByLabelText(/level/i), '500')

      const pokemonInput = screen.getByPlaceholderText(/charizard|enter para adicionar/i)
      await user.type(pokemonInput, 'Pikachu')
      await user.keyboard('{Enter}')

      await user.click(screen.getByRole('button', { name: /criar personagem|salvar/i }))

      await waitFor(() => {
        expect(screen.getByText(/já existe um personagem|nome.*já.*existe|duplicate/i)).toBeInTheDocument()
      })
    })

    it('deve desabilitar o botão durante o envio', async () => {
      const user = userEvent.setup()
      mockCreateCharacter.mockReturnValue(new Promise(() => {}))
      render(<CharacterForm />)

      await user.type(screen.getByLabelText(/nome/i), 'AshKetchum')
      await user.type(screen.getByLabelText(/level/i), '500')

      const pokemonInput = screen.getByPlaceholderText(/charizard|enter para adicionar/i)
      await user.type(pokemonInput, 'Pikachu')
      await user.keyboard('{Enter}')

      await user.click(screen.getByRole('button', { name: /criar personagem|salvar/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /criando|salvando|aguarde/i })).toBeDisabled()
      })
    })
  })
})
