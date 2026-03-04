// Tipos globais da aplicação

export interface Profile {
  id: string
  user_id: string
  username: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  user_id: string
  name: string
  level: number
  clan: ClanName
  pokemons: string[]
  created_at: string
  updated_at: string
}

// Clãs reais do PokéxGames
export const CLAN_NAMES = [
  'Nenhum',
  'Naturia',
  'Malefic',
  'Wingeon',
  'Raibolt',
  'Volcanic',
  'Gardestrike',
  'Orebound',
  'Psycraft',
  'Seavell',
  'Ironhard',
] as const

export type ClanName = (typeof CLAN_NAMES)[number]

// Cores temáticas de cada clã (Tailwind CSS classes)
export const CLAN_COLORS: Record<ClanName, { bg: string; text: string; border: string; dot: string }> = {
  Nenhum:      { bg: 'bg-gray-100 dark:bg-gray-800',       text: 'text-gray-600 dark:text-gray-400',       border: 'border-gray-300 dark:border-gray-600',   dot: 'bg-gray-400' },
  Naturia:     { bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-400',      border: 'border-green-300 dark:border-green-700', dot: 'bg-green-500' },
  Malefic:     { bg: 'bg-purple-100 dark:bg-purple-900/30',text: 'text-purple-700 dark:text-purple-400',    border: 'border-purple-300 dark:border-purple-700',dot: 'bg-purple-500' },
  Wingeon:     { bg: 'bg-sky-100 dark:bg-sky-900/30',      text: 'text-sky-700 dark:text-sky-400',          border: 'border-sky-300 dark:border-sky-700',     dot: 'bg-sky-500' },
  Raibolt:     { bg: 'bg-yellow-100 dark:bg-yellow-900/30',text: 'text-yellow-700 dark:text-yellow-400',    border: 'border-yellow-300 dark:border-yellow-700',dot: 'bg-yellow-500' },
  Volcanic:    { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-700 dark:text-red-400',          border: 'border-red-300 dark:border-red-700',     dot: 'bg-red-500' },
  Gardestrike: { bg: 'bg-pink-100 dark:bg-pink-900/30',    text: 'text-pink-700 dark:text-pink-400',        border: 'border-pink-300 dark:border-pink-700',   dot: 'bg-pink-500' },
  Orebound:    { bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-400',      border: 'border-amber-300 dark:border-amber-700', dot: 'bg-amber-600' },
  Psycraft:    { bg: 'bg-violet-100 dark:bg-violet-900/30',text: 'text-violet-700 dark:text-violet-400',    border: 'border-violet-300 dark:border-violet-700',dot: 'bg-violet-500' },
  Seavell:     { bg: 'bg-cyan-100 dark:bg-cyan-900/30',    text: 'text-cyan-700 dark:text-cyan-400',        border: 'border-cyan-300 dark:border-cyan-700',   dot: 'bg-cyan-500' },
  Ironhard:    { bg: 'bg-slate-100 dark:bg-slate-800',     text: 'text-slate-600 dark:text-slate-400',      border: 'border-slate-300 dark:border-slate-600', dot: 'bg-slate-500' },
}

export interface HuntEntry {
  id: string
  user_id: string
  char_id: string
  loot: number
  expenses: number
  net_profit: number
  duration: number
  pokemon_target: string
  created_at: string
}

export interface Session {
  user: {
    id: string
    email?: string
    user_metadata: {
      avatar_url?: string
      full_name?: string
      name?: string
    }
  }
  access_token: string
}
