/**
 * App Providers - Central place for all app-wide providers
 */

import React, { ReactNode, useEffect } from 'react';
import { setupDependencies } from '@/src/di/inject';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders component wraps the entire app with necessary providers
 * Ensures dependencies are initialized before any component renders
 */
export function AppProviders({ children }: AppProvidersProps): React.ReactElement {
  useEffect(() => {
    setupDependencies();
  }, []);

  return <>{children}</>;
}
