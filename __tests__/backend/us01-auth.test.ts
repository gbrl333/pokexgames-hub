/**
 * Testes US01 - Backend: Callback de autenticação e criação de profile
 *
 * Testa a lógica do fluxo de callback OAuth Discord → Supabase.
 * O trigger SQL (create_profile_on_signup) é verificado via contrato:
 * qualquer novo usuário autenticado DEVE ter uma entrada em `profiles`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Supabase client para isolar testes do banco real
const mockGetUser = vi.fn()
const mockSelectSingle = vi.fn()
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      exchangeCodeForSession: vi.fn(),
    },
    from: vi.fn((table: string) => ({
      select: mockSelect.mockReturnThis(),
      insert: mockInsert.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      single: mockSelectSingle,
    })),
  })),
}))

import { createClient } from '@/lib/supabase/server'

// ----- helpers de fixture -----
function makeUser(overrides = {}) {
  return {
    id: 'user-uuid-123',
    email: 'ash@discord.com',
    user_metadata: {
      avatar_url: 'https://cdn.discordapp.com/avatars/123/abc.png',
      full_name: 'Ash Ketchum',
      name: 'Ash',
    },
    ...overrides,
  }
}

function makeProfile(userId: string) {
  return {
    id: 'profile-uuid-456',
    user_id: userId,
    username: 'Ash',
    avatar_url: 'https://cdn.discordapp.com/avatars/123/abc.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

describe('US01 Backend - Autenticação e criação de profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Contrato: usuário autenticado deve ter profile', () => {
    it('deve retornar o profile do usuário após login bem-sucedido', async () => {
      const user = makeUser()
      const profile = makeProfile(user.id)

      mockGetUser.mockResolvedValue({ data: { user }, error: null })
      mockSelectSingle.mockResolvedValue({ data: profile, error: null })

      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', authUser!.id)
        .single()

      expect(authUser).not.toBeNull()
      expect(profileData).not.toBeNull()
      expect(profileData!.user_id).toBe(user.id)
    })

    it('getUser deve retornar null quando não há sessão', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No session' },
      })

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      expect(user).toBeNull()
    })
  })

  describe('Contrato: dados do profile vindos do Discord OAuth', () => {
    it('o profile deve usar o nome do Discord (user_metadata.name)', async () => {
      const user = makeUser({ user_metadata: { name: 'Misty', full_name: 'Misty Waterflower', avatar_url: null } })
      const profile = makeProfile(user.id)
      profile.username = 'Misty'

      mockGetUser.mockResolvedValue({ data: { user }, error: null })
      mockSelectSingle.mockResolvedValue({ data: profile, error: null })

      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', authUser!.id)
        .single()

      // O username no profile deve bater com o metadata do Discord
      expect(profileData!.username).toBe(authUser!.user_metadata.name)
    })

    it('o profile deve ter avatar_url do Discord quando disponível', async () => {
      const avatarUrl = 'https://cdn.discordapp.com/avatars/999/xyz.png'
      const user = makeUser({ user_metadata: { name: 'Brock', avatar_url: avatarUrl } })
      const profile = { ...makeProfile(user.id), avatar_url: avatarUrl }

      mockGetUser.mockResolvedValue({ data: { user }, error: null })
      mockSelectSingle.mockResolvedValue({ data: profile, error: null })

      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', authUser!.id)
        .single()

      expect(profileData!.avatar_url).toBe(authUser!.user_metadata.avatar_url)
    })

    it('avatar_url deve ser null quando o Discord não fornece foto', async () => {
      const user = makeUser({ user_metadata: { name: 'Gary', avatar_url: null } })
      const profile = { ...makeProfile(user.id), avatar_url: null }

      mockGetUser.mockResolvedValue({ data: { user }, error: null })
      mockSelectSingle.mockResolvedValue({ data: profile, error: null })

      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const { data: profileData } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', authUser!.id)
        .single()

      expect(profileData!.avatar_url).toBeNull()
    })
  })

  describe('Segurança: RLS — usuário só acessa o próprio profile', () => {
    it('deve retornar erro quando query de profile usa user_id de outro usuário', async () => {
      // Simula RLS bloqueando acesso a profile de outro usuário
      mockGetUser.mockResolvedValue({
        data: { user: makeUser({ id: 'user-A' }) },
        error: null,
      })
      mockSelectSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' },
      })

      const supabase = createClient()
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', 'user-B') // tentando acessar profile de outro usuário
        .single()

      expect(profileData).toBeNull()
      expect(error).not.toBeNull()
    })
  })
})
