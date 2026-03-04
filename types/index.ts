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

// Array constante usado pelo Zod enum e pelo select do formulário
export const CLAN_NAMES = ['Nenhum', 'Impulso', 'Elemento', 'Enigma', 'Frenesi', 'Harmonia'] as const

export type ClanName = (typeof CLAN_NAMES)[number]

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
