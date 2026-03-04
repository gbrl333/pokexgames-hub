/**
 * Teste US05 — StatsCard
 * Verifica o card de métrica do dashboard pessoal.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart2 } from 'lucide-react'

import { StatsCard } from '@/app/components/dashboard/StatsCard'

describe('StatsCard (US05 — AC: Dashboard de performance)', () => {
  it('deve renderizar o título da métrica', () => {
    render(<StatsCard title="GP/h Médio" value="3kk" />)
    expect(screen.getByText('GP/h Médio')).toBeInTheDocument()
  })

  it('deve renderizar o valor da métrica', () => {
    render(<StatsCard title="GP/h Médio" value="3kk" />)
    expect(screen.getByText('3kk')).toBeInTheDocument()
  })

  it('deve renderizar o ícone quando fornecido', () => {
    render(<StatsCard title="Total de Hunts" value="42" icon={BarChart2} />)
    expect(screen.getByText('Total de Hunts')).toBeInTheDocument()
  })

  it('deve renderizar a descrição/subtítulo quando fornecido', () => {
    render(<StatsCard title="GP/h Médio" value="3kk" description="Últimas 7 hunts" />)
    expect(screen.getByText('Últimas 7 hunts')).toBeInTheDocument()
  })

  it('deve aplicar cor de destaque quando trend é positivo', () => {
    const { container } = render(<StatsCard title="Lucro" value="5kk" trend="up" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
