export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '\uC6D0'
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}\uC5B5\uC6D0`
  if (amount >= 10_000) return `${(amount / 10_000).toFixed(0)}\uB9CC\uC6D0`
  return formatCurrency(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '\uC624\uB298'
  if (diffDays === 1) return '\uC5B4\uC81C'
  if (diffDays < 7) return `${diffDays}\uC77C \uC804`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}\uC8FC \uC804`
  return formatDate(dateString)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}
