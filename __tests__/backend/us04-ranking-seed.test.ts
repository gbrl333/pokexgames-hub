/**
 * Testes US04 - Validação dos dados de seed do ranking
 *
 * Estes testes garantem que os cálculos de GP/h para os dados de teste inseridos
 * no Supabase (002_seed_test_data.sql) estão corretos e que a lógica da view
 * v_global_stats produzirá os resultados esperados.
 *
 * Os dados espelham exatamente o que está no seed SQL:
 * - 3 personagens: DragonitoTester (Impulso/500), AlakazamTester (Elemento/400),
 *   MewtwoTester (Enigma/300) — todos do user_id de teste
 * - 15 hunt_entries distribuídas por 5 pokémons: Dragonite, Alakazam, Mewtwo, Gengar, Blastoise
 */
import { describe, it, expect } from 'vitest'
import { calculateAverageGpPerHour, formatGp } from '@/lib/huntCalculations'
import { sortByGpPerHour, sortByPokemon, filterByClan, filterByLevelRange } from '@/lib/rankingHelpers'

// ---------------------------------------------------------------------------
// Dados que espelham exatamente o seed SQL (002_seed_test_data.sql)
// Cada entrada representa uma hunt_entry no banco com seus loot/expenses/duration
// ---------------------------------------------------------------------------

/** Hunts de Dragonite — char: DragonitoTester (Impulso, level 500) */
const dragoniteHunts = [
  { net_profit: 4_500_000, duration: 90 },  // 3kk/h
  { net_profit: 3_000_000, duration: 60 },  // 3kk/h
  { net_profit: 6_000_000, duration: 120 }, // 3kk/h
]

/** Hunts de Alakazam — char: AlakazamTester (Elemento, level 400) */
const alakazamHunts = [
  { net_profit: 5_000_000, duration: 60 },  // 5kk/h
  { net_profit: 2_500_000, duration: 30 },  // 5kk/h
  { net_profit: 7_500_000, duration: 90 },  // 5kk/h
]

/** Hunts de Mewtwo — char: MewtwoTester (Enigma, level 300) */
const mewtwoHunts = [
  { net_profit: 8_000_000, duration: 60 },  // 8kk/h
  { net_profit: 4_000_000, duration: 30 },  // 8kk/h
  { net_profit: 16_000_000, duration: 120 }, // 8kk/h
]

/** Hunts de Gengar — char: DragonitoTester (Impulso, level 500) */
const gengarHunts = [
  { net_profit: 2_000_000, duration: 60 },  // 2kk/h
  { net_profit: 1_000_000, duration: 30 },  // 2kk/h
  { net_profit: 4_000_000, duration: 120 }, // 2kk/h
]

/** Hunts de Blastoise — char: AlakazamTester (Elemento, level 400) */
const blastoiseHunts = [
  { net_profit: 4_000_000, duration: 60 },  // 4kk/h
  { net_profit: 2_000_000, duration: 30 },  // 4kk/h
  { net_profit: 8_000_000, duration: 120 }, // 4kk/h
]

// ---------------------------------------------------------------------------
// Resultado esperado da view v_global_stats após o seed
// (simula o GROUP BY pokemon_target, clan que a view faz no banco)
// ---------------------------------------------------------------------------
const expectedRankingRows = [
  {
    pokemon_target: 'Dragonite',
    clan: 'Impulso',
    avg_gp_per_hour: calculateAverageGpPerHour(dragoniteHunts),
    min_level: 500,
    max_level: 500,
    total_hunts: dragoniteHunts.length,
  },
  {
    pokemon_target: 'Alakazam',
    clan: 'Elemento',
    avg_gp_per_hour: calculateAverageGpPerHour(alakazamHunts),
    min_level: 400,
    max_level: 400,
    total_hunts: alakazamHunts.length,
  },
  {
    pokemon_target: 'Mewtwo',
    clan: 'Enigma',
    avg_gp_per_hour: calculateAverageGpPerHour(mewtwoHunts),
    min_level: 300,
    max_level: 300,
    total_hunts: mewtwoHunts.length,
  },
  {
    pokemon_target: 'Gengar',
    clan: 'Impulso',
    avg_gp_per_hour: calculateAverageGpPerHour(gengarHunts),
    min_level: 500,
    max_level: 500,
    total_hunts: gengarHunts.length,
  },
  {
    pokemon_target: 'Blastoise',
    clan: 'Elemento',
    avg_gp_per_hour: calculateAverageGpPerHour(blastoiseHunts),
    min_level: 400,
    max_level: 400,
    total_hunts: blastoiseHunts.length,
  },
]

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('US04 Seed — Cálculo de GP/h para cada Pokémon do seed', () => {
  it('Dragonite (Impulso/500) deve ter GP/h = 3kk/h', () => {
    const gpPerHour = calculateAverageGpPerHour(dragoniteHunts)
    expect(gpPerHour).toBe(3_000_000)
    expect(formatGp(gpPerHour)).toBe('3kk')
  })

  it('Alakazam (Elemento/400) deve ter GP/h = 5kk/h', () => {
    const gpPerHour = calculateAverageGpPerHour(alakazamHunts)
    expect(gpPerHour).toBe(5_000_000)
    expect(formatGp(gpPerHour)).toBe('5kk')
  })

  it('Mewtwo (Enigma/300) deve ter GP/h = 8kk/h', () => {
    const gpPerHour = calculateAverageGpPerHour(mewtwoHunts)
    expect(gpPerHour).toBe(8_000_000)
    expect(formatGp(gpPerHour)).toBe('8kk')
  })

  it('Gengar (Impulso/500) deve ter GP/h = 2kk/h', () => {
    const gpPerHour = calculateAverageGpPerHour(gengarHunts)
    expect(gpPerHour).toBe(2_000_000)
    expect(formatGp(gpPerHour)).toBe('2kk')
  })

  it('Blastoise (Elemento/400) deve ter GP/h = 4kk/h', () => {
    const gpPerHour = calculateAverageGpPerHour(blastoiseHunts)
    expect(gpPerHour).toBe(4_000_000)
    expect(formatGp(gpPerHour)).toBe('4kk')
  })
})

describe('US04 Seed — Ordenação do ranking simulado', () => {
  // sortByGpPerHour espera a propriedade `gp_per_hour` (como no fixture do us04-ranking.test.ts)
  // A view v_global_stats retorna `avg_gp_per_hour`; mapeamos para o helper:
  const rowsForSort = expectedRankingRows.map((r) => ({
    ...r,
    gp_per_hour: r.avg_gp_per_hour,
  }))

  it('deve ordenar por GP/h desc: Mewtwo > Alakazam > Blastoise > Dragonite > Gengar', () => {
    const sorted = sortByGpPerHour(rowsForSort)
    const names = sorted.map((r) => r.pokemon_target)
    expect(names).toEqual(['Mewtwo', 'Alakazam', 'Blastoise', 'Dragonite', 'Gengar'])
  })

  it('deve ordenar por Pokémon alfabeticamente: Alakazam, Blastoise, Dragonite, Gengar, Mewtwo', () => {
    const sorted = sortByPokemon(expectedRankingRows)
    const names = sorted.map((r) => r.pokemon_target)
    expect(names).toEqual(['Alakazam', 'Blastoise', 'Dragonite', 'Gengar', 'Mewtwo'])
  })
})

describe('US04 Seed — Filtros no ranking simulado', () => {
  it('deve filtrar por clã "Impulso" e retornar Dragonite e Gengar', () => {
    const result = filterByClan(expectedRankingRows, 'Impulso')
    const names = result.map((r) => r.pokemon_target)
    expect(result).toHaveLength(2)
    expect(names).toContain('Dragonite')
    expect(names).toContain('Gengar')
  })

  it('deve filtrar por clã "Elemento" e retornar Alakazam e Blastoise', () => {
    const result = filterByClan(expectedRankingRows, 'Elemento')
    const names = result.map((r) => r.pokemon_target)
    expect(result).toHaveLength(2)
    expect(names).toContain('Alakazam')
    expect(names).toContain('Blastoise')
  })

  it('deve filtrar por clã "Enigma" e retornar apenas Mewtwo', () => {
    const result = filterByClan(expectedRankingRows, 'Enigma')
    expect(result).toHaveLength(1)
    expect(result[0].pokemon_target).toBe('Mewtwo')
  })

  it('deve filtrar por level range 400-500 e retornar Dragonite, Alakazam, Gengar, Blastoise', () => {
    const result = filterByLevelRange(expectedRankingRows, 400, 500)
    const names = result.map((r) => r.pokemon_target)
    expect(result).toHaveLength(4)
    expect(names).toContain('Dragonite')
    expect(names).toContain('Alakazam')
    expect(names).toContain('Gengar')
    expect(names).toContain('Blastoise')
    expect(names).not.toContain('Mewtwo')
  })

  it('deve filtrar por level range 300-300 e retornar apenas Mewtwo', () => {
    const result = filterByLevelRange(expectedRankingRows, 300, 300)
    expect(result).toHaveLength(1)
    expect(result[0].pokemon_target).toBe('Mewtwo')
  })

  it('deve retornar todos os 5 pokémons sem filtros (clan=null, range 1-1000)', () => {
    const withoutClan = filterByClan(expectedRankingRows, null)
    expect(withoutClan).toHaveLength(5)

    const fullRange = filterByLevelRange(expectedRankingRows, 1, 1000)
    expect(fullRange).toHaveLength(5)
  })
})

describe('US04 Seed — Totais de hunts por Pokémon', () => {
  it('cada Pokémon deve ter exatamente 3 hunts no seed', () => {
    for (const row of expectedRankingRows) {
      expect(row.total_hunts).toBe(3)
    }
  })

  it('total geral deve ser 15 hunts (5 pokémons × 3 hunts)', () => {
    const total = expectedRankingRows.reduce((sum, r) => sum + r.total_hunts, 0)
    expect(total).toBe(15)
  })
})
