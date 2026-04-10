/**
 * Entry point for Dependency Injection
 * Delegates to inject.ts which registers ALL app dependencies.
 * Imported by app/_layout.tsx on startup.
 */
import { setupDependencies } from './inject';

// Inicializar todas las dependencias al importar este módulo
setupDependencies();
