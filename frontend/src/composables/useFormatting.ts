/**
 * Composable for number and currency formatting
 * Provides consistent formatting across the application
 */
export function useFormatting() {
  /**
   * Format number for human readability with thousand separators
   * @param value - Number to format
   * @returns Formatted number string with 2 decimal places
   */
  function formatNumber(value: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Format currency with UZS symbol using Uzbek locale
   * @param value - Number to format as currency
   * @returns Formatted currency string
   */
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Format quantity (whole numbers) with thousand separators
   * @param value - Number to format
   * @returns Formatted quantity string
   */
  function formatQuantity(value: number): string {
    return new Intl.NumberFormat('uz-UZ').format(value)
  }

  /**
   * Format percentage with locale-specific formatting
   * @param value - Number to format as percentage (0.25 = 25%)
   * @returns Formatted percentage string
   */
  function formatPercentage(value: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Format compact numbers (1K, 1M, etc.)
   * @param value - Number to format
   * @returns Compact formatted number string
   */
  function formatCompact(value: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value)
  }

  return {
    formatNumber,
    formatCurrency,
    formatQuantity,
    formatPercentage,
    formatCompact,
  }
}
