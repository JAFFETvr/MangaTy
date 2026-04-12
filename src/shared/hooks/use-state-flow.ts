/**
 * useStateFlow hook - Simulates Kotlin StateFlow pattern for MVVM
 * Used in ViewModels to expose observable state to components
 */

import { useEffect, useState } from 'react';

export class StateFlow<T> {
  private value: T;
  private listeners: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  getValue(): T {
    return this.value;
  }

  setValue(newValue: T): void {
    if (newValue !== this.value) {
      this.value = newValue;
      this.notify();
    }
  }

  subscribe(listener: (value: T) => void): () => void {
    this.listeners.add(listener);
    // Emit current value immediately
    listener(this.value);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.value));
  }
}

/**
 * Hook to use StateFlow in React components
 * Returns current value and updates on every change
 */
export function useStateFlow<T>(stateFlow: StateFlow<T>): T {
  const [value, setValue] = useState<T>(stateFlow.getValue());

  useEffect(() => {
    const unsubscribe = stateFlow.subscribe((newValue) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [stateFlow]);

  return value;
}
