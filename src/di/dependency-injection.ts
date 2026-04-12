/**
 * Entry point for Dependency Injection
 * Delegates to inject.ts which registers ALL app dependencies.
 * Imported by app/_layout.tsx on startup.
 */
import { setupDependencies } from './inject';
import { TokenStorageService } from '@/src/core/http/token-storage-service';

// Initialize HTTP client with stored token
TokenStorageService.initializeHttpClient().catch((error) => {
  console.error('⚠️ Failed to initialize HTTP client:', error);
});

// Inicializar todas las dependencias al importar este módulo
setupDependencies();
