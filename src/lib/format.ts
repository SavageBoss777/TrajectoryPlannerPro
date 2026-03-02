export function formatDollar(value: number, decimals = 0): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  return `${sign}$${(abs / 1000).toFixed(decimals)}k`;
}
