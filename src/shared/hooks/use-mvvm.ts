/**
 * useMVVM hook - Helper to use ViewModels in components
 */

import { useEffect } from 'react';

/**
 * Initialize and cleanup ViewModel lifecycle
 * Call onInit when component mounts, onDestroy when unmounts
 */
export function useMVVM(
  onInit?: () => void | Promise<void>,
  onDestroy?: () => void
): void {
  useEffect(() => {
    // Initialize on mount
    if (onInit) {
      const result = onInit();
      if (result instanceof Promise) {
        result.catch((e) => console.error('Error in MVVM onInit:', e));
      }
    }

    // Cleanup on unmount
    return () => {
      if (onDestroy) {
        onDestroy();
      }
    };
  }, [onInit, onDestroy]);
}
