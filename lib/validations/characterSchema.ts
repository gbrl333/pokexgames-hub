import { z } from 'zod'
import { CLAN_NAMES } from '@/types/index'

// Schema de validação do formulário de criação/edição de personagem (US02)
export const characterSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres')
    .trim(),
  level: z
    .number({ error: 'O nível deve ser um número' })
    .int('O nível deve ser um número inteiro')
    .min(1, 'O nível mínimo é 1')
    .max(1000, 'O nível máximo é 1000'),
  clan: z.enum(CLAN_NAMES, 'Clã inválido'),
  pokemons: z
    .array(z.string().min(1, 'Nome do Pokémon não pode ser vazio').trim())
    .min(1, 'Adicione pelo menos 1 Pokémon')
    .max(6, 'O time pode ter no máximo 6 Pokémons'),
})

export type CharacterFormData = z.infer<typeof characterSchema>
