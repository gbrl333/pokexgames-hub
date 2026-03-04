/**
 * Testes US01 - AC Frontend: Skeleton Screen durante validação de sessão
 *
 * Estes testes definem o comportamento esperado do componente AuthGuard.
 * Devem FALHAR até que a implementação seja criada (TDD - Red phase).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthGuard } from '@/app/components/auth/AuthGuard'

// Mock do Supabase client
const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

// Conteúdo protegido de exemplo para os testes
function ProtectedContent() {
  return <div data-testid="protected-content">Conteúdo protegido</div>
}

describe('AuthGuard (US01 - AC: Skeleton Screen de validação)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Estado de carregamento (Skeleton)', () => {
    it('deve mostrar o skeleton enquanto a sessão está sendo validada', () => {
      // Simula uma chamada que demora (nunca resolve durante a renderização inicial)
      mockGetUser.mockReturnValue(new Promise(() => {}))

      render(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
      )

      // O skeleton deve estar visível
      expect(screen.getByTestId('auth-skeleton')).toBeInTheDocument()
      // O conteúdo protegido NÃO deve ser visível ainda
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('o skeleton deve ter aria-label de acessibilidade', () => {
      mockGetUser.mockReturnValue(new Promise(() => {}))

      render(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
      )

      const skeleton = screen.getByTestId('auth-skeleton')
      expect(skeleton).toHaveAttribute('aria-label', expect.stringMatching(/carregando|loading/i))
    })
  })

  describe('Estado autenticado', () => {
    it('deve mostrar o conteúdo filho quando a sessão é resolvida com sucesso', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@discord.com' } },
        error: null,
      })

      render(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
      )

      // Aguarda a resolução da promise
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })

      // O skeleton não deve mais estar visível
      expect(screen.queryByTestId('auth-skeleton')).not.toBeInTheDocument()
    })
  })

  describe('Estado não autenticado', () => {
    it('deve ocultar o conteúdo filho quando não há sessão', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No session' },
      })

      render(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
      )

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      })
    })

    it('deve ocultar também o skeleton quando não há sessão (evitar flash)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No session' },
      })

      render(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
      )

      await waitFor(() => {
        expect(screen.queryByTestId('auth-skeleton')).not.toBeInTheDocument()
      })
    })
  })

  describe('Estado de erro', () => {
    it('deve não renderizar conteúdo se o Supabase retornar erro', async () => {
      mockGetUser.mockRejectedValue(new Error('Erro de rede'))

      render(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
      )

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
        expect(screen.queryByTestId('auth-skeleton')).not.toBeInTheDocument()
      })
    })
  })
})
