/**
 * US05 — Dashboard de Performance Pessoal
 * Testa a lógica de busca das últimas 7 hunts e a exibição correta para o utilizador logado.
 * Regra principal: Query otimizada para buscar as últimas 7 hunts do utilizador logado.
 */

import { describe, it, expect } from 'vitest'
import { getLastNHunts } from '@/lib/rankingHelpers'
import type { HuntEntry } from '@/types/index'

// -------------------------------------------------------------------
// Fixtures
// -------------------------------------------------------------------

function makeHunt(overrides: Partial<HuntEntry> & { created_at: string }): HuntEntry {
  return {
    id: overrides.id ?? 'hunt-1',
    user_id: overrides.user_id ?? 'user-abc',
    char_id: overrides.char_id ?? 'char-1',
    loot: overrides.loot ?? 1_000_000,
    expenses: overrides.expenses ?? 400_000,
    net_profit: overrides.net_profit ?? 600_000,
    duration: overrides.duration ?? 60,
    pokemon_target: overrides.pokemon_target ?? 'Magikarp',
    created_at: overrides.created_at,
  }
}

const BASE_DATE = new Date('2025-01-10T12:00:00Z')

/** Gera N hunts com datas decrescentes a partir de BASE_DATE */
function makeHunts(n: number): HuntEntry[] {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(BASE_DATE)
    date.setDate(date.getDate() - i) // dia mais recente = índice 0
    return makeHunt({ id: `hunt-${i + 1}`, created_at: date.toISOString() })
  })
}

// -------------------------------------------------------------------
// Testes
// -------------------------------------------------------------------

describe('US05 — getLastNHunts (dashboard pessoal)', () => {
  describe('retorna as últimas N hunts', () => {
    it('deve retornar as últimas 7 hunts quando existem mais de 7 registos', () => {
      const hunts = makeHunts(10)
      const result = getLastNHunts(hunts, 7)
      expect(result).toHaveLength(7)
    })

    it('deve retornar todas as hunts quando existem menos de 7 registos', () => {
      const hunts = makeHunts(4)
      const result = getLastNHunts(hunts, 7)
      expect(result).toHaveLength(4)
    })

    it('deve retornar array vazio quando não há registos', () => {
      const result = getLastNHunts([], 7)
      expect(result).toHaveLength(0)
    })

    it('deve retornar exatamente 7 quando existem exatamente 7 registos', () => {
      const hunts = makeHunts(7)
      const result = getLastNHunts(hunts, 7)
      expect(result).toHaveLength(7)
    })
  })

  describe('ordenação por data decrescente', () => {
    it('deve retornar a hunt mais recente primeiro', () => {
      const hunts = makeHunts(5) // índice 0 = mais recente
      // Embaralha para garantir que a função está a ordenar, não a depender da ordem de entrada
      const shuffled = [...hunts].reverse()
      const result = getLastNHunts(shuffled, 5)
      expect(result[0].id).toBe('hunt-1') // hunt-1 = mais recente
    })

    it('deve retornar as hunts em ordem cronológica decrescente', () => {
      const hunts = makeHunts(5)
      const shuffled = [hunts[4], hunts[1], hunts[3], hunts[0], hunts[2]]
      const result = getLastNHunts(shuffled, 5)
      const dates = result.map((h) => new Date(h.created_at).getTime())
      // Cada data deve ser >= a próxima
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1])
      }
    })

    it('deve excluir as hunts mais antigas quando há mais de N registos', () => {
      const hunts = makeHunts(10)
      const result = getLastNHunts(hunts, 7)
      // hunt-8, hunt-9, hunt-10 devem ser excluídas (são as mais antigas)
      const ids = result.map((h) => h.id)
      expect(ids).not.toContain('hunt-8')
      expect(ids).not.toContain('hunt-9')
      expect(ids).not.toContain('hunt-10')
    })

    it('deve incluir as hunts mais recentes quando há mais de N registos', () => {
      const hunts = makeHunts(10)
      const result = getLastNHunts(hunts, 7)
      const ids = result.map((h) => h.id)
      expect(ids).toContain('hunt-1')
      expect(ids).toContain('hunt-7')
    })
  })

  describe('parâmetro N personalizado', () => {
    it('deve respeitar N=3', () => {
      const hunts = makeHunts(10)
      const result = getLastNHunts(hunts, 3)
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('hunt-1')
    })

    it('deve usar N=7 como padrão quando não é fornecido', () => {
      const hunts = makeHunts(10)
      const result = getLastNHunts(hunts)
      expect(result).toHaveLength(7)
    })

    it('deve respeitar N=1', () => {
      const hunts = makeHunts(5)
      const result = getLastNHunts(hunts, 1)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('hunt-1')
    })
  })

  describe('imutabilidade — não deve mutar o array original', () => {
    it('não deve alterar a ordem do array de entrada', () => {
      const hunts = makeHunts(5).reverse() // ordem ascendente
      const originalFirst = hunts[0].id
      getLastNHunts(hunts, 5)
      expect(hunts[0].id).toBe(originalFirst) // array original inalterado
    })
  })

  describe('integridade dos dados retornados', () => {
    it('deve preservar todos os campos da HuntEntry', () => {
      const hunt = makeHunt({
        id: 'hunt-special',
        user_id: 'user-xyz',
        char_id: 'char-abc',
        loot: 2_000_000,
        expenses: 500_000,
        net_profit: 1_500_000,
        duration: 90,
        pokemon_target: 'Dragonite',
        created_at: '2025-01-10T12:00:00Z',
      })
      const result = getLastNHunts([hunt], 7)
      expect(result[0]).toEqual(hunt)
    })

    it('deve funcionar com hunts de utilizadores diferentes (isolamento é responsabilidade da query)', () => {
      const hunts = [
        makeHunt({ id: 'h1', user_id: 'user-A', created_at: '2025-01-10T12:00:00Z' }),
        makeHunt({ id: 'h2', user_id: 'user-B', created_at: '2025-01-09T12:00:00Z' }),
      ]
      // A função pura retorna ambos — filtragem por user_id é responsabilidade da query Supabase
      const result = getLastNHunts(hunts, 7)
      expect(result).toHaveLength(2)
    })
  })
})
