import { z } from 'zod'

// Schema de validação do registro de hunt (US03)
export const huntSchema = z.object({
  char_id: z.string().uuid('ID do personagem inválido'),
  loot: z
    .number({ error: 'O loot deve ser um número' })
    .int('O loot deve ser um número inteiro')
    .min(0, 'O loot não pode ser negativo'),
  expenses: z
    .number({ error: 'O gasto deve ser um número' })
    .int('O gasto deve ser um número inteiro')
    .min(0, 'O gasto não pode ser negativo'),
  duration: z
    .number({ error: 'A duração deve ser um número' })
    .positive('A duração deve ser maior que zero'),
  pokemon_target: z
    .string()
    .min(1, 'Informe o Pokémon alvo')
    .max(50, 'Nome do Pokémon muito longo')
    .trim(),
})

export type HuntFormData = z.infer<typeof huntSchema>
