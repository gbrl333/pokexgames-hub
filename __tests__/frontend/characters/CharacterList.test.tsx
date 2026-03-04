/**
 * Teste US02 — CharacterList
 * Verifica a lista de personagens: renderização, estado vazio.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Character } from '@/types/index'

import { CharacterList } from '@/app/components/characters/CharacterList'

const makeCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: 'char-1',
  user_id: 'user-1',
  name: 'AshKetchum',
  level: 500,
  clan: 'Impulso',
  pokemons: ['Pikachu', 'Charizard'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

describe('CharacterList (US02 — AC: Lista de personagens)', () => {
  describe('Estado vazio', () => {
    it('deve mostrar mensagem de empty state quando não há personagens', () => {
      render(<CharacterList characters={[]} />)
      expect(screen.getByText(/nenhum personagem|sem personagens|adicione/i)).toBeInTheDocument()
    })
  })

  describe('Lista com personagens', () => {
    it('deve renderizar o nome do personagem', () => {
      render(<CharacterList characters={[makeCharacter()]} />)
      expect(screen.getByText('AshKetchum')).toBeInTheDocument()
    })

    it('deve renderizar o level do personagem', () => {
      render(<CharacterList characters={[makeCharacter({ level: 750 })]} />)
      expect(screen.getByText(/750/)).toBeInTheDocument()
    })

    it('deve renderizar o clã do personagem', () => {
      render(<CharacterList characters={[makeCharacter({ clan: 'Impulso' })]} />)
      expect(screen.getByText(/impulso/i)).toBeInTheDocument()
    })

    it('deve renderizar todos os personagens', () => {
      const chars = [
        makeCharacter({ id: 'c1', name: 'Ash' }),
        makeCharacter({ id: 'c2', name: 'Misty' }),
        makeCharacter({ id: 'c3', name: 'Brock' }),
      ]
      render(<CharacterList characters={chars} />)
      expect(screen.getByText('Ash')).toBeInTheDocument()
      expect(screen.getByText('Misty')).toBeInTheDocument()
      expect(screen.getByText('Brock')).toBeInTheDocument()
    })

    it('deve renderizar os pokémons do personagem como badges', () => {
      render(<CharacterList characters={[makeCharacter({ pokemons: ['Pikachu', 'Charizard'] })]} />)
      expect(screen.getByText('Pikachu')).toBeInTheDocument()
      expect(screen.getByText('Charizard')).toBeInTheDocument()
    })
  })
})
