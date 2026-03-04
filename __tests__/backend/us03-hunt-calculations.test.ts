/**
 * Testes US03 - Backend: Cálculos de Hunt (funções puras)
 *
 * Cobre:
 * - calculateNetProfit: loot - expenses
 * - calculateGpPerHour: (net_profit / duration) * 60
 * - calculateAverageGpPerHour: SUM(net_profit) / SUM(duration) * 60
 * - Casos extremos: duração zero, valores negativos, precisão
 */
import { describe, it, expect } from 'vitest'
import {
  calculateNetProfit,
  calculateGpPerHour,
  calculateAverageGpPerHour,
  formatGp,
} from '@/lib/huntCalculations'

describe('US03 Backend - calculateNetProfit', () => {
  it('deve calcular lucro positivo: loot > expenses', () => {
    expect(calculateNetProfit(5_000_000, 2_000_000)).toBe(3_000_000)
  })

  it('deve calcular prejuízo negativo: loot < expenses', () => {
    expect(calculateNetProfit(1_000_000, 3_000_000)).toBe(-2_000_000)
  })

  it('deve retornar 0 quando loot === expenses', () => {
    expect(calculateNetProfit(2_000_000, 2_000_000)).toBe(0)
  })

  it('deve aceitar loot zero', () => {
    expect(calculateNetProfit(0, 1_000_000)).toBe(-1_000_000)
  })

  it('deve aceitar expenses zero', () => {
    expect(calculateNetProfit(5_000_000, 0)).toBe(5_000_000)
  })

  it('deve aceitar ambos zero', () => {
    expect(calculateNetProfit(0, 0)).toBe(0)
  })

  it('deve calcular corretamente com valores grandes (KKs)', () => {
    expect(calculateNetProfit(50_000_000, 10_000_000)).toBe(40_000_000)
  })
})

describe('US03 Backend - calculateGpPerHour', () => {
  it('deve calcular 3kk/h para 3kk de lucro em 60 minutos', () => {
    expect(calculateGpPerHour(3_000_000, 60)).toBe(3_000_000)
  })

  it('deve calcular 6kk/h para 3kk de lucro em 30 minutos', () => {
    expect(calculateGpPerHour(3_000_000, 30)).toBe(6_000_000)
  })

  it('deve calcular 1.5kk/h para 3kk de lucro em 120 minutos', () => {
    expect(calculateGpPerHour(3_000_000, 120)).toBe(1_500_000)
  })

  it('deve retornar GP/h negativo com prejuízo', () => {
    expect(calculateGpPerHour(-2_000_000, 60)).toBe(-2_000_000)
  })

  it('deve lançar erro com duração zero', () => {
    expect(() => calculateGpPerHour(1_000_000, 0)).toThrow('duração deve ser maior que zero')
  })

  it('deve lançar erro com duração negativa', () => {
    expect(() => calculateGpPerHour(1_000_000, -10)).toThrow('duração deve ser maior que zero')
  })

  it('deve arredondar para número inteiro', () => {
    // 1_000_000 / 45 * 60 = 1_333_333.33...
    const result = calculateGpPerHour(1_000_000, 45)
    expect(Number.isInteger(result)).toBe(true)
    expect(result).toBe(1_333_333)
  })
})

describe('US03/US04 Backend - calculateAverageGpPerHour (lógica da view)', () => {
  it('deve calcular média correta para múltiplas hunts', () => {
    const hunts = [
      { net_profit: 3_000_000, duration: 60 },  // 3kk/h
      { net_profit: 2_000_000, duration: 60 },  // 2kk/h
    ]
    // SUM(5kk) / SUM(120min) * 60 = 2.5kk/h
    expect(calculateAverageGpPerHour(hunts)).toBe(2_500_000)
  })

  it('deve retornar 0 para lista vazia', () => {
    expect(calculateAverageGpPerHour([])).toBe(0)
  })

  it('deve retornar 0 quando duração total é zero', () => {
    const hunts = [{ net_profit: 1_000_000, duration: 0 }]
    expect(calculateAverageGpPerHour(hunts)).toBe(0)
  })

  it('deve ponderar corretamente hunts com durações diferentes', () => {
    const hunts = [
      { net_profit: 6_000_000, duration: 120 }, // 3kk/h
      { net_profit: 1_000_000, duration: 60 },  // 1kk/h
    ]
    // SUM(7kk) / SUM(180min) * 60 = 2.333...kk/h ≈ 2_333_333
    const result = calculateAverageGpPerHour(hunts)
    expect(result).toBe(2_333_333)
  })

  it('deve lidar com lucro negativo no cálculo de média', () => {
    const hunts = [
      { net_profit: 5_000_000, duration: 60 },
      { net_profit: -1_000_000, duration: 60 },
    ]
    // SUM(4kk) / SUM(120min) * 60 = 2kk/h
    expect(calculateAverageGpPerHour(hunts)).toBe(2_000_000)
  })
})

describe('US04 Backend - formatGp', () => {
  it('deve formatar 1.000.000 como "1kk"', () => {
    expect(formatGp(1_000_000)).toBe('1kk')
  })

  it('deve formatar 2.500.000 como "2.5kk"', () => {
    expect(formatGp(2_500_000)).toBe('2.5kk')
  })

  it('deve formatar 10.000.000 como "10kk"', () => {
    expect(formatGp(10_000_000)).toBe('10kk')
  })

  it('deve formatar 500.000 como "500k"', () => {
    expect(formatGp(500_000)).toBe('500k')
  })

  it('deve formatar 1.500 como "1.5k"', () => {
    expect(formatGp(1_500)).toBe('1.5k')
  })

  it('deve formatar 999 sem sufixo', () => {
    expect(formatGp(999)).toBe('999')
  })

  it('deve formatar 0 como "0"', () => {
    expect(formatGp(0)).toBe('0')
  })

  it('deve formatar valores negativos (prejuízo)', () => {
    expect(formatGp(-1_000_000)).toBe('-1kk')
    expect(formatGp(-500_000)).toBe('-500k')
  })

  it('não deve manter zeros desnecessários: 1.00kk → 1kk', () => {
    expect(formatGp(1_000_000)).toBe('1kk')
    expect(formatGp(1_100_000)).toBe('1.1kk')
  })
})
