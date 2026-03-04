'use server'

import { huntSchema } from '@/lib/validations/huntSchema'
import { calculateNetProfit } from '@/lib/huntCalculations'
import { createClient } from '@/lib/supabase/server'
import type { HuntEntry } from '@/types/index'

export interface CreateHuntResult {
  success: boolean
  error?: string
  /** Quando logado: { id, net_profit }. Quando offline: objeto HuntEntry completo. */
  data?: { id: string; net_profit: number } | HuntEntry
  /** true quando a hunt foi salva apenas em memória (sem login) */
  local?: boolean
}

/**
 * Server Action para registrar uma sessão de hunt (US03).
 * - net_profit é SEMPRE calculado no servidor — nunca aceito do cliente.
 * - Com login: persiste no Supabase e valida ownership do char_id.
 * - Sem login: valida os dados e devolve um objeto local para o hook adicionar em memória.
 */
export async function createHuntAction(
  rawData: unknown,
): Promise<CreateHuntResult> {
  // 1. Valida os dados recebidos do cliente
  const parsed = huntSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
    }
  }

  const { char_id, loot, expenses, duration, pokemon_target } = parsed.data

  // 2. Calcula net_profit no servidor — nunca aceito do cliente
  const net_profit = calculateNetProfit(loot, expenses)

  // 3. Verifica autenticação
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sem login: retorna hunt local para ser adicionada ao estado em memória
  if (!user) {
    const localHunt: HuntEntry = {
      id: `local-${Date.now()}`,
      user_id: 'local',
      char_id,
      loot,
      expenses,
      net_profit,
      duration,
      pokemon_target,
      created_at: new Date().toISOString(),
    }
    return { success: true, data: localHunt, local: true }
  }

  // 4. Com login: verifica se o char_id pertence ao usuário autenticado
  const { data: character, error: charError } = await supabase
    .from('characters')
    .select('id')
    .eq('id', char_id)
    .eq('user_id', user.id)
    .single()

  if (charError || !character) {
    return { success: false, error: 'Personagem não encontrado ou não pertence ao usuário' }
  }

  // 5. Insere no banco
  const { data, error: insertError } = await supabase
    .from('hunt_entries')
    .insert({
      user_id: user.id,
      char_id,
      loot,
      expenses,
      net_profit,
      duration,
      pokemon_target,
    })
    .select('id, net_profit')
    .single()

  if (insertError) {
    return { success: false, error: 'Erro ao registrar hunt' }
  }

  return { success: true, data }
}
