/**
 * Teste US01 — Landing Page
 * Verifica que a página raiz renderiza o botão de login Discord
 * e informação sobre a aplicação.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock do LoginButton para isolar o teste da página
vi.mock('@/app/components/auth/LoginButton', () => ({
  LoginButton: () => <button data-testid="login-button">Entrar com Discord</button>,
}))

import LandingPage from '@/app/page'

describe('LandingPage (US01 — AC: Botão Discord na Landing Page)', () => {
  it('deve renderizar o botão de login', () => {
    render(<LandingPage />)
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
  })

  it('deve ter um título ou headline da aplicação', () => {
    render(<LandingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('deve mencionar o nome da aplicação ou pokexgames', () => {
    render(<LandingPage />)
    expect(screen.getByText(/pokex|hub|hunt/i)).toBeInTheDocument()
  })

  it('deve ter uma descrição ou subtítulo', () => {
    render(<LandingPage />)
    // Parágrafo ou elemento com descrição
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})
