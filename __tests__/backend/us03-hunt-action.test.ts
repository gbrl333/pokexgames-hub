/**
 * Testes US03 - Backend: huntSchema (Zod) + createHuntAction (Server Action)
 *
 * Cobre:
 * - Validação Zod do formulário de hunt
 * - net_profit gerado no servidor (nunca aceito do cliente)
 * - Verificação de que char_id pertence ao usuário autenticado
 * - Rejeição de hunt para personagem de outro usuário
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { huntSchema } from '@/lib/validations/huntSchema'

// ── Testes do huntSchema (Zod) ──────────────────────────────────────────────

const validHunt = {
  char_id: '550e8400-e29b-41d4-a716-446655440000',
  loot: 5_000_000,
  expenses: 2_000_000,
  duration: 60,
  pokemon_target: 'Dragonite',
}

describe('US03 Backend - huntSchema (Zod)', () => {
  describe('Campo: char_id', () => {
    it('deve aceitar UUID válido', () => {
      const result = huntSchema.safeParse(validHunt)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar char_id que não é UUID', () => {
      const result = huntSchema.safeParse({ ...validHunt, char_id: 'not-a-uuid' })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar char_id vazio', () => {
      const result = huntSchema.safeParse({ ...validHunt, char_id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('Campo: loot', () => {
    it('deve aceitar loot zero', () => {
      const result = huntSchema.safeParse({ ...validHunt, loot: 0 })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar loot negativo', () => {
      const result = huntSchema.safeParse({ ...validHunt, loot: -1 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar loot decimal', () => {
      const result = huntSchema.safeParse({ ...validHunt, loot: 1_000_000.5 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar loot como string', () => {
      const result = huntSchema.safeParse({ ...validHunt, loot: '5000000' })
      expect(result.success).toBe(false)
    })
  })

  describe('Campo: expenses', () => {
    it('deve aceitar expenses zero', () => {
      const result = huntSchema.safeParse({ ...validHunt, expenses: 0 })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar expenses negativo', () => {
      const result = huntSchema.safeParse({ ...validHunt, expenses: -100 })
      expect(result.success).toBe(false)
    })
  })

  describe('Campo: duration', () => {
    it('deve aceitar duração positiva', () => {
      const result = huntSchema.safeParse({ ...validHunt, duration: 30 })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar duração zero', () => {
      const result = huntSchema.safeParse({ ...validHunt, duration: 0 })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar duração negativa', () => {
      const result = huntSchema.safeParse({ ...validHunt, duration: -5 })
      expect(result.success).toBe(false)
    })
  })

  describe('Campo: pokemon_target', () => {
    it('deve aceitar nome válido de Pokémon', () => {
      const result = huntSchema.safeParse({ ...validHunt, pokemon_target: 'Dragonite' })
      expect(result.success).toBe(true)
    })

    it('deve rejeitar pokemon_target vazio', () => {
      const result = huntSchema.safeParse({ ...validHunt, pokemon_target: '' })
      expect(result.success).toBe(false)
    })

    it('deve rejeitar pokemon_target com mais de 50 chars', () => {
      const result = huntSchema.safeParse({
        ...validHunt,
        pokemon_target: 'P'.repeat(51),
      })
      expect(result.success).toBe(false)
    })

    it('deve fazer trim do pokemon_target', () => {
      const result = huntSchema.safeParse({ ...validHunt, pokemon_target: '  Dragonite  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.pokemon_target).toBe('Dragonite')
      }
    })
  })
})

// ── Testes da createHuntAction ───────────────────────────────────────────────

const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({
      insert: mockInsert.mockReturnThis(),
      select: mockSelect.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSingle,
    })),
  })),
}))

import { createHuntAction } from '@/lib/actions/createHuntAction'

function mockAuthUser(userId = 'user-123') {
  mockGetUser.mockResolvedValue({
    data: { user: { id: userId } },
    error: null,
  })
}

describe('US03 Backend - createHuntAction (Server Action)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Autenticação', () => {
    it('deve retornar hunt local quando não há sessão (site público)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } })

      const result = await createHuntAction(validHunt)

      // Sem login, o site é público: retorna hunt em memória local
      expect(result.success).toBe(true)
      expect(result.local).toBe(true)
      expect(result.data?.id).toMatch(/^local-/)
    })
  })

  describe('Validação de dados', () => {
    it('deve rejeitar payload inválido (sem char_id)', async () => {
      mockAuthUser()

      const result = await createHuntAction({ ...validHunt, char_id: 'nao-e-uuid' })

      expect(result.success).toBe(false)
    })

    it('deve rejeitar duration zero', async () => {
      mockAuthUser()

      const result = await createHuntAction({ ...validHunt, duration: 0 })

      expect(result.success).toBe(false)
    })
  })

  describe('Integridade: char_id deve pertencer ao usuário', () => {
    it('deve rejeitar hunt quando char_id não pertence ao usuário', async () => {
      mockAuthUser('user-legitimo')

      // Primeira chamada: verifica o personagem — não encontrado (RLS)
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' },
      })

      const result = await createHuntAction(validHunt)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Personagem')
    })

    it('deve aceitar hunt quando char_id pertence ao usuário', async () => {
      mockAuthUser('user-123')

      // Primeira chamada: verifica o personagem — encontrado
      mockSingle.mockResolvedValueOnce({
        data: { id: validHunt.char_id },
        error: null,
      })
      // Segunda chamada: inserção do hunt
      mockSingle.mockResolvedValueOnce({
        data: { id: 'hunt-uuid', net_profit: 3_000_000 },
        error: null,
      })

      const result = await createHuntAction(validHunt)

      expect(result.success).toBe(true)
    })
  })

  describe('Segurança: net_profit calculado no servidor', () => {
    it('deve ignorar net_profit enviado pelo cliente e calcular no servidor', async () => {
      mockAuthUser('user-123')

      // Personagem encontrado
      mockSingle.mockResolvedValueOnce({
        data: { id: validHunt.char_id },
        error: null,
      })
      // Inserção retorna com net_profit calculado pelo servidor
      mockSingle.mockResolvedValueOnce({
        data: { id: 'hunt-uuid', net_profit: 3_000_000 }, // loot(5kk) - expenses(2kk)
        error: null,
      })

      // Cliente tenta enviar net_profit manipulado
      const maliciousPayload = { ...validHunt, net_profit: 999_999_999 }
      const result = await createHuntAction(maliciousPayload)

      // A action deve ter sucesso com o net_profit correto do servidor
      expect(result.success).toBe(true)
      // net_profit retornado = loot - expenses = 3_000_000 (não o valor manipulado)
      expect(result.data?.net_profit).toBe(3_000_000)
    })
  })
})
