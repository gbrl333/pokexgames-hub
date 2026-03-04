/**
 * Testes US01 - AC Frontend: Middleware de proteção de rotas
 *
 * Estes testes definem o comportamento esperado do middleware de autenticação.
 * Devem FALHAR até que a implementação seja criada (TDD - Red phase).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock deve ser declarado no topo antes dos imports que dependem dele
const mockGetUser = vi.fn()
const mockSetAll = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

// Import após o mock para garantir que o módulo use a versão mockada
import { middleware, config } from '@/middleware'

/**
 * Cria um NextRequest fake para os testes
 */
function createRequest(pathname: string): NextRequest {
  const url = `http://localhost:3000${pathname}`
  return new NextRequest(url)
}

describe('middleware (US01 - AC: Proteção de rotas)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    })
  })

  describe('Rotas públicas do dashboard (não requerem autenticação)', () => {
    it('deve permitir acesso a /dashboard sem sessão (site público)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const request = createRequest('/dashboard')
      const response = await middleware(request)

      // Dashboard é público — não deve redirecionar para /login
      const location = response?.headers.get('location') ?? ''
      expect(location).not.toContain('/login')
    })

    it('deve permitir acesso a /dashboard/* sem sessão (site público)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

      const request = createRequest('/dashboard/characters')
      const response = await middleware(request)

      // Sub-rotas do dashboard também são públicas
      const location = response?.headers.get('location') ?? ''
      expect(location).not.toContain('/login')
    })

    it('deve permitir acesso a /dashboard quando há sessão válida', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@discord.com' } },
        error: null,
      })

      const request = createRequest('/dashboard')
      const response = await middleware(request)

      // Não deve redirecionar para /login — location deve ser null ou não conter /login
      const location = response?.headers.get('location') ?? ''
      expect(location).not.toContain('/login')
    })
  })

  describe('Rotas públicas (não requerem autenticação)', () => {
    it('não deve bloquear a rota raiz /', async () => {
      const request = createRequest('/')
      const response = await middleware(request)

      const location = response?.headers.get('location') ?? ''
      expect(location).not.toContain('/login')
    })

    it('não deve bloquear a rota /login', async () => {
      const request = createRequest('/login')
      const response = await middleware(request)

      // Sem sessão, /login não deve redirecionar para /dashboard
      const location = response?.headers.get('location') ?? ''
      expect(location).not.toContain('/dashboard')
    })

    it('não deve bloquear rotas de callback de auth', async () => {
      const request = createRequest('/auth/callback')
      const response = await middleware(request)

      const location = response?.headers.get('location') ?? ''
      expect(location).not.toContain('/login')
    })
  })

  describe('Redirecionamento de usuário já logado', () => {
    it('deve redirecionar /login para /dashboard se já houver sessão', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@discord.com' } },
        error: null,
      })

      const request = createRequest('/login')
      const response = await middleware(request)

      expect(response?.headers.get('location')).toContain('/dashboard')
    })
  })

  describe('Configuração do matcher', () => {
    it('deve exportar config com matcher definido', () => {
      expect(config).toBeDefined()
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
    })

    it('o matcher deve cobrir todas as rotas da aplicação (catch-all)', () => {
      // O matcher usa regex catch-all que exclui assets estáticos
      const matcherString = JSON.stringify(config.matcher)
      // Deve ter pelo menos uma entrada
      expect(config.matcher.length).toBeGreaterThan(0)
      // Deve excluir _next/static para performance
      expect(matcherString).toContain('_next')
    })
  })
})
