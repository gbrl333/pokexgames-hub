/**
 * Testes US02 - Backend: Validação Zod do CharacterSchema
 *
 * Cobre todos os Acceptance Criteria de backend da US02:
 * - Validação de name (min 3 chars)
 * - Validação de level (1-1000)
 * - Validação de clan (Enum)
 * - Validação do array de pokemons (max 6)
 */
import { describe, it, expect } from 'vitest'
import { characterSchema } from '@/lib/validations/characterSchema'
import { CLAN_NAMES } from '@/types/index'

// Fixture de dado válido base
const validCharacter = {
  name: 'AshKetchum',
  level: 500,
  clan: 'Naturia' as const,
  pokemons: ['Pikachu', 'Charizard'],
}

describe('US02 Backend - characterSchema (Zod)', () => {
  describe('Campo: name', () => {
    it('deve aceitar um nome válido com 3+ caracteres', () => {
      const result = characterSchema.safeParse(validCharacter)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar nome com menos de 3 caracteres', () => {
      const result = characterSchema.safeParse({ ...validCharacter, name: 'Ab' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('3')
      }
    })

    it('deve rejeitar nome com exatamente 2 caracteres', () => {
      const result = characterSchema.safeParse({ ...validCharacter, name: 'Ab' })
      expect(result.success).toBe(false)
    })

    it('deve aceitar nome com exatamente 3 caracteres', () => {
      const result = characterSchema.safeParse({ ...validCharacter, name: 'Ash' })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar nome com mais de 50 caracteres', () => {
      const longName = 'A'.repeat(51)
      const result = characterSchema.safeParse({ ...validCharacter, name: longName })
      expect(result.success).toBe(false)
    })

    it('deve aceitar nome com exatamente 50 caracteres', () => {
      const name50 = 'A'.repeat(50)
      const result = characterSchema.safeParse({ ...validCharacter, name: name50 })
      expect(result.success).toBe(true)
    })

    it('deve fazer trim de espaços em branco no nome', () => {
      const result = characterSchema.safeParse({ ...validCharacter, name: '  Ash  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Ash')
      }
    })

    it('deve rejeitar nome vazio', () => {
      const result = characterSchema.safeParse({ ...validCharacter, name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Campo: level', () => {
    it('deve aceitar level 1 (mínimo)', () => {
      const result = characterSchema.safeParse({ ...validCharacter, level: 1 })
      expect(result.success).toBe(true)
    })

    it('deve aceitar level 1000 (máximo)', () => {
      const result = characterSchema.safeParse({ ...validCharacter, level: 1000 })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar level 0', () => {
      const result = characterSchema.safeParse({ ...validCharacter, level: 0 })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1')
      }
    })

    it('deve rejeitar level negativo', () => {
      const result = characterSchema.safeParse({ ...validCharacter, level: -1 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar level 1001', () => {
      const result = characterSchema.safeParse({ ...validCharacter, level: 1001 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar level decimal', () => {
      const result = characterSchema.safeParse({ ...validCharacter, level: 100.5 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar level como string', () => {
      const result = characterSchema.safeParse({ ...validCharacter, level: '500' })
      expect(result.success).toBe(false)
    })
  })

  describe('Campo: clan (Enum)', () => {
    it('deve aceitar todos os clãs válidos', () => {
      for (const clan of CLAN_NAMES) {
        const result = characterSchema.safeParse({ ...validCharacter, clan })
        expect(result.success, `clan "${clan}" deve ser válido`).toBe(true)
      }
    })

    it('deve rejeitar clã inválido', () => {
      const result = characterSchema.safeParse({ ...validCharacter, clan: 'ClanInexistente' })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar string vazia como clã', () => {
      const result = characterSchema.safeParse({ ...validCharacter, clan: '' })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar clã com case diferente (case-sensitive)', () => {
      const result = characterSchema.safeParse({ ...validCharacter, clan: 'impulso' })
      expect(result.success).toBe(false)
    })
  })

  describe('Campo: pokemons (array de tags)', () => {
    it('deve aceitar array com 1 Pokémon (mínimo)', () => {
      const result = characterSchema.safeParse({ ...validCharacter, pokemons: ['Pikachu'] })
      expect(result.success).toBe(true)
    })

    it('deve aceitar array com 6 Pokémons (máximo)', () => {
      const result = characterSchema.safeParse({
        ...validCharacter,
        pokemons: ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Gengar', 'Mewtwo'],
      })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar array vazio', () => {
      const result = characterSchema.safeParse({ ...validCharacter, pokemons: [] })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1 Pokémon')
      }
    })

    it('deve rejeitar array com 7 Pokémons', () => {
      const result = characterSchema.safeParse({
        ...validCharacter,
        pokemons: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6')
      }
    })

    it('deve rejeitar Pokémon com nome vazio dentro do array', () => {
      const result = characterSchema.safeParse({ ...validCharacter, pokemons: ['Pikachu', ''] })
      expect(result.success).toBe(false)
    })

    it('deve fazer trim de espaços nos nomes dos Pokémons', () => {
      const result = characterSchema.safeParse({ ...validCharacter, pokemons: ['  Pikachu  '] })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.pokemons[0]).toBe('Pikachu')
      }
    })
  })

  describe('Objeto completo válido', () => {
    it('deve parsear e retornar o objeto correto com todos os campos', () => {
      const result = characterSchema.safeParse(validCharacter)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject(validCharacter)
      }
    })

    it('deve rejeitar objeto sem nenhum campo', () => {
      const result = characterSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
