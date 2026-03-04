import type { HuntEntry } from '@/types/index'

/**
 * Ordena hunts por GP/h descendente.
 * Usado na US04 (ranking comunitário).
 */
export function sortByGpPerHour(
  entries: Array<{ gp_per_hour: number; [key: string]: unknown }>,
): typeof entries {
  return [...entries].sort((a, b) => b.gp_per_hour - a.gp_per_hour)
}

/**
 * Ordena hunts por Pokémon alvo (alfabético).
 * Usado na US04.
 */
export function sortByPokemon(
  entries: Array<{ pokemon_target: string; [key: string]: unknown }>,
): typeof entries {
  return [...entries].sort((a, b) => a.pokemon_target.localeCompare(b.pokemon_target))
}

/**
 * Filtra entradas pelo clã (client-side, US04).
 */
export function filterByClan(
  entries: Array<{ clan: string; [key: string]: unknown }>,
  clan: string | null,
): typeof entries {
  if (!clan) return entries
  return entries.filter((e) => e.clan === clan)
}

/**
 * Filtra entradas pelo range de level (client-side, US04).
 */
export function filterByLevelRange(
  entries: Array<{ min_level?: number; max_level?: number; [key: string]: unknown }>,
  minLevel: number,
  maxLevel: number,
): typeof entries {
  return entries.filter((e) => {
    const entryMin = e.min_level ?? 0
    const entryMax = e.max_level ?? 1000
    return entryMin >= minLevel && entryMax <= maxLevel
  })
}

/**
 * Retorna as últimas N hunts de um usuário, ordenadas por data decrescente.
 * Replica a lógica da query da US05.
 */
export function getLastNHunts(hunts: HuntEntry[], n: number = 7): HuntEntry[] {
  return [...hunts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, n)
}
