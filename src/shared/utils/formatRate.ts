const rateFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 6 })

// Taxa de câmbio em BRL por unidade da moeda estrangeira (até 6 casas, como no backend).
export function formatRate(value: number): string {
  return rateFormat.format(value)
}
