/**
 * Testes US01 - AC Frontend: Botão de login com branding do Discord
 *
 * Estes testes definem o comportamento esperado do componente LoginButton.
 * Devem FALHAR até que a implementação seja criada (TDD - Red phase).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginButton } from '@/app/components/auth/LoginButton'

// Mock do Supabase client para isolar o teste do componente
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  })),
}))

describe('LoginButton (US01 - AC: Botão Discord na Landing Page)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o botão com texto identificando o Discord', () => {
    render(<LoginButton />)

    // O botão deve conter texto relacionado ao Discord
    const button = screen.getByRole('button', { name: /discord/i })
    expect(button).toBeInTheDocument()
  })

  it('deve ter um atributo aria-label acessível', () => {
    render(<LoginButton />)

    const button = screen.getByRole('button', { name: /entrar com discord/i })
    expect(button).toBeInTheDocument()
  })

  it('deve chamar signInWithOAuth com provider discord ao ser clicado', async () => {
    const user = userEvent.setup()
    const { createClient } = await import('@/lib/supabase/client')
    const mockSignIn = vi.fn().mockResolvedValue({ data: {}, error: null })
    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithOAuth: mockSignIn },
    } as unknown as ReturnType<typeof createClient>)

    render(<LoginButton />)

    const button = screen.getByRole('button', { name: /discord/i })
    await user.click(button)

    expect(mockSignIn).toHaveBeenCalledOnce()
    expect(mockSignIn).toHaveBeenCalledWith({
      provider: 'discord',
      options: {
        redirectTo: expect.stringContaining('/auth/callback'),
      },
    })
  })

  it('deve desabilitar o botão enquanto o login está em progresso', async () => {
    const user = userEvent.setup()
    const { createClient } = await import('@/lib/supabase/client')

    // Simula uma chamada que demora (promise que nunca resolve durante o teste)
    const neverResolves = new Promise<never>(() => {})
    vi.mocked(createClient).mockReturnValue({
      auth: {
        signInWithOAuth: vi.fn().mockReturnValue(neverResolves),
      },
    } as unknown as ReturnType<typeof createClient>)

    render(<LoginButton />)

    const button = screen.getByRole('button', { name: /discord/i })
    await user.click(button)

    // Após o clique, o botão deve ser desabilitado para evitar duplo clique
    expect(button).toBeDisabled()
  })

  it('deve ter branding visual do Discord (classe ou ícone identificável)', () => {
    render(<LoginButton />)

    // O botão deve ter um data-testid ou ícone que identifique visualmente o Discord
    const discordIcon = screen.getByTestId('discord-icon')
    expect(discordIcon).toBeInTheDocument()
  })
})
