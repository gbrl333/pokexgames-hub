/**
 * Testes US04 - Backend: Ranking comunitário (v_global_stats)
 *
 * Cobre:
 * - Lógica da view v_global_stats: SUM(net_profit) / SUM(duration) * 60
 * - Sort por GP/h e por Pokémon
 * - Filtros client-side: clã e range de level
 * - Formatação de números (1kk, 500k, etc.)
 */
import { describe, it, expect } from 'vitest'
import {
  sortByGpPerHour,
  sortByPokemon,
  filterByClan,
  filterByLevelRange,
} from '@/lib/rankingHelpers'
import { calculateAverageGpPerHour, formatGp } from '@/lib/huntCalculations'

// Fixture: entradas simulando o resultado da view v_global_stats
const rankingEntries = [
  { pokemon_target: 'Dragonite', clan: 'Impulso', gp_per_hour: 3_000_000, min_level: 400, max_level: 600 },
  { pokemon_target: 'Alakazam', clan: 'Elemento', gp_per_hour: 5_000_000, min_level: 300, max_level: 500 },
  { pokemon_target: 'Mewtwo', clan: 'Impulso', gp_per_hour: 8_000_000, min_level: 700, max_level: 1000 },
  { pokemon_target: 'Gengar', clan: 'Enigma', gp_per_hour: 2_000_000, min_level: 200, max_level: 400 },
  { pokemon_target: 'Blastoise', clan: 'Harmonia', gp_per_hour: 4_000_000, min_level: 250, max_level: 450 },
]

describe('US04 Backend - v_global_stats (lógica de cálculo)', () => {
  describe('Cálculo SUM(net_profit) / SUM(duration) * 60', () => {
    it('deve calcular média ponderada corretamente (não média simples)', () => {
      // Hunt 1: 6kk em 120min = 3kk/h
      // Hunt 2: 1kk em 60min  = 1kk/h
      // Média simples seria 2kk/h, mas a view faz: 7kk/180min*60 = 2.33kk/h
      const hunts = [
        { net_profit: 6_000_000, duration: 120 },
        { net_profit: 1_000_000, duration: 60 },
      ]
      const avg = calculateAverageGpPerHour(hunts)
      expect(avg).toBe(2_333_333)
      expect(avg).not.toBe(2_000_000) // garante que não é média simples
    })

    it('deve agrupar por pokemon_target e calcular GP/h correto', () => {
      // Simula o GROUP BY pokemon_target da view
      const dragoniteHunts = [
        { net_profit: 3_000_000, duration: 60 },
        { net_profit: 3_000_000, duration: 60 },
      ]
      expect(calculateAverageGpPerHour(dragoniteHunts)).toBe(3_000_000)
    })

    it('deve retornar 0 para grupo sem hunts', () => {
      expect(calculateAverageGpPerHour([])).toBe(0)
    })
  })
})

describe('US04 Backend - Ordenação do ranking', () => {
  describe('sortByGpPerHour', () => {
    it('deve ordenar por GP/h descendente', () => {
      const sorted = sortByGpPerHour(rankingEntries)
      expect(sorted[0].gp_per_hour).toBe(8_000_000) // Mewtwo
      expect(sorted[1].gp_per_hour).toBe(5_000_000) // Alakazam
      expect(sorted[2].gp_per_hour).toBe(4_000_000) // Blastoise
      expect(sorted[3].gp_per_hour).toBe(3_000_000) // Dragonite
      expect(sorted[4].gp_per_hour).toBe(2_000_000) // Gengar
    })

    it('não deve mutar o array original', () => {
      const original = [...rankingEntries]
      sortByGpPerHour(rankingEntries)
      expect(rankingEntries).toEqual(original)
    })

    it('deve retornar array vazio para entrada vazia', () => {
      expect(sortByGpPerHour([])).toEqual([])
    })

    it('deve lidar com GP/h iguais sem lançar erro', () => {
      const entries = [
        { gp_per_hour: 3_000_000 },
        { gp_per_hour: 3_000_000 },
      ]
      expect(() => sortByGpPerHour(entries)).not.toThrow()
    })
  })

  describe('sortByPokemon', () => {
    it('deve ordenar por nome de Pokémon alfabeticamente', () => {
      const sorted = sortByPokemon(rankingEntries)
      const names = sorted.map((e) => e.pokemon_target)
      expect(names).toEqual(['Alakazam', 'Blastoise', 'Dragonite', 'Gengar', 'Mewtwo'])
    })

    it('não deve mutar o array original', () => {
      const original = rankingEntries.map((e) => e.pokemon_target)
      sortByPokemon(rankingEntries)
      expect(rankingEntries.map((e) => e.pokemon_target)).toEqual(original)
    })
  })
})

describe('US04 Backend - Filtros client-side', () => {
  describe('filterByClan', () => {
    it('deve filtrar por clã específico', () => {
      const result = filterByClan(rankingEntries, 'Impulso')
      expect(result).toHaveLength(2)
      expect(result.every((e) => e.clan === 'Impulso')).toBe(true)
    })

    it('deve retornar todos quando clan é null', () => {
      const result = filterByClan(rankingEntries, null)
      expect(result).toHaveLength(rankingEntries.length)
    })

    it('deve retornar array vazio para clã inexistente', () => {
      const result = filterByClan(rankingEntries, 'ClanInexistente')
      expect(result).toHaveLength(0)
    })

    it('não deve mutar o array original', () => {
      const original = [...rankingEntries]
      filterByClan(rankingEntries, 'Impulso')
      expect(rankingEntries).toEqual(original)
    })
  })

  describe('filterByLevelRange', () => {
    it('deve filtrar por range de level', () => {
      // Busca entradas cujo min_level >= 300 e max_level <= 600
      const result = filterByLevelRange(rankingEntries, 300, 600)
      const names = result.map((e) => e.pokemon_target)
      expect(names).toContain('Dragonite') // 400-600 ✓
      expect(names).toContain('Alakazam')  // 300-500 ✓
      expect(names).not.toContain('Mewtwo') // 700-1000 ✗
      expect(names).not.toContain('Gengar') // 200-400 ✗
    })

    it('deve retornar todos com range completo 1-1000', () => {
      // Nenhuma entrada tem max_level > 1000 ou min_level < 1
      const allEntries = rankingEntries.map((e) => ({ ...e, min_level: 1, max_level: 1000 }))
      const result = filterByLevelRange(allEntries, 1, 1000)
      expect(result).toHaveLength(allEntries.length)
    })

    it('deve retornar array vazio quando nenhum entra no range', () => {
      const result = filterByLevelRange(rankingEntries, 900, 1000)
      // Apenas Mewtwo (700-1000) mas min_level 700 < 900, não passa
      expect(result).toHaveLength(0)
    })
  })
})

describe('US04 Backend - Formatação de números para exibição', () => {
  const cases: [number, string][] = [
    [1_000_000, '1kk'],
    [2_500_000, '2.5kk'],
    [10_000_000, '10kk'],
    [500_000, '500k'],
    [1_500, '1.5k'],
    [999, '999'],
    [0, '0'],
    [-1_000_000, '-1kk'],
    [-500_000, '-500k'],
  ]

  it.each(cases)('deve formatar %i como "%s"', (input, expected) => {
    expect(formatGp(input)).toBe(expected)
  })
})
