/**
 * Helper functions
 */

/**
 * Simulate async operation with delay
 * Useful for mocking API calls in datasources
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format percentage value for display
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format time difference for display (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `Hace ${diffMins} minuto(s)`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora(s)`;
  } else if (diffDays === 1) {
    return 'Ayer';
  } else {
    return `Hace ${diffDays} día(s)`;
  }
}
