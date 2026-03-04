/**
 * Calcula o lucro líquido de uma hunt.
 * Regra: net_profit = loot - expenses
 * Esta função é usada tanto no client (preview dinâmico - US03)
 * quanto no servidor (validação final - US03 AC Backend).
 */
export function calculateNetProfit(loot: number, expenses: number): number {
  return loot - expenses
}

/**
 * Calcula o GP por hora de uma hunt.
 * Regra: gp_per_hour = (net_profit / duration_minutes) * 60
 * duration é em minutos.
 */
export function calculateGpPerHour(netProfit: number, durationMinutes: number): number {
  if (durationMinutes <= 0) {
    throw new Error('A duração deve ser maior que zero')
  }
  return Math.round((netProfit / durationMinutes) * 60)
}

/**
 * Formata um número em GP para exibição (ex: 1000000 → "1kk", 500000 → "500k").
 * Usado na US04 (ranking) e US05 (dashboard).
 */
export function formatGp(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (abs >= 1_000_000) {
    const kk = abs / 1_000_000
    // Remove zeros desnecessários: 1.00kk → 1kk, 1.50kk → 1.5kk
    return `${sign}${parseFloat(kk.toFixed(2))}kk`
  }

  if (abs >= 1_000) {
    const k = abs / 1_000
    return `${sign}${parseFloat(k.toFixed(2))}k`
  }

  return `${sign}${abs}`
}

/**
 * Calcula a média de GP/h a partir de uma lista de hunts.
 * Replica a lógica da view v_global_stats: SUM(net_profit) / SUM(duration) * 60
 */
export function calculateAverageGpPerHour(
  hunts: Array<{ net_profit: number; duration: number }>,
): number {
  if (hunts.length === 0) return 0

  const totalProfit = hunts.reduce((sum, h) => sum + h.net_profit, 0)
  const totalDuration = hunts.reduce((sum, h) => sum + h.duration, 0)

  if (totalDuration <= 0) return 0

  return Math.round((totalProfit / totalDuration) * 60)
}
