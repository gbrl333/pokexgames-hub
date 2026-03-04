'use server'

import { characterSchema } from '@/lib/validations/characterSchema'
import { createClient } from '@/lib/supabase/server'
import type { Character } from '@/types/index'

export interface CreateCharacterResult {
  success: boolean
  error?: string
  /** Quando logado: { id, name }. Quando offline: objeto Character completo. */
  data?: { id: string; name: string } | Character
  /** true quando o personagem foi salvo apenas em memória (sem login) */
  local?: boolean
}

/**
 * Server Action para criar um novo personagem (US02).
 * - Com login: persiste no Supabase com user_id do servidor.
 * - Sem login: valida os dados e devolve um objeto local para o hook adicionar em memória.
 */
export async function createCharacterAction(
  rawData: unknown,
): Promise<CreateCharacterResult> {
  // 1. Valida os dados
  const parsed = characterSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
    }
  }

  // 2. Verifica autenticação
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sem login: retorna um personagem local para ser adicionado ao estado em memória
  if (!user) {
    const localCharacter: Character = {
      id: `local-${Date.now()}`,
      user_id: 'local',
      name: parsed.data.name,
      level: parsed.data.level,
      clan: parsed.data.clan,
      pokemons: parsed.data.pokemons,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return { success: true, data: localCharacter, local: true }
  }

  // 3. Com login: insere no banco — user_id vem do servidor, nunca do cliente
  const { data, error: insertError } = await supabase
    .from('characters')
    .insert({
      ...parsed.data,
      user_id: user.id,
    })
    .select('id, name')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return { success: false, error: 'Já existe um personagem com este nome' }
    }
    return { success: false, error: 'Erro ao criar personagem' }
  }

  return { success: true, data }
}
