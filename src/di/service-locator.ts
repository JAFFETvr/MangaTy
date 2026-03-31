/**
 * Service Locator - Manual dependency injection container
 * Similar to GetIt in Flutter or Hilt in Android
 */

type ServiceFactory<T> = () => T | Promise<T>;
type SingletonInstance<T> = T;

export class ServiceLocator {
  private factories: Map<string, ServiceFactory<any>> = new Map();
  private singletons: Map<string, SingletonInstance<any>> = new Map();

  /**
   * Register a service as a factory (new instance every time)
   */
  register<T>(key: string, factory: ServiceFactory<T>): void {
    this.factories.set(key, factory);
  }

  /**
   * Register a service as a singleton (same instance always)
   */
  registerSingleton<T>(key: string, factory: ServiceFactory<T>): void {
    const instance = factory();
    this.singletons.set(key, instance);
  }

  /**
   * Get a service instance
   */
  get<T = any>(key: string): T {
    // Check singleton first
    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T;
    }

    // Check factory
    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      return factory() as T;
    }

    throw new Error(`Service not found: ${key}`);
  }

  /**
   * Check if service is registered
   */
  has(key: string): boolean {
    return this.singletons.has(key) || this.factories.has(key);
  }

  /**
   * Clear all registered services and singletons
   */
  clear(): void {
    this.factories.clear();
    this.singletons.clear();
  }
}

// Global service locator instance
export const serviceLocator = new ServiceLocator();

/**
 * Dependency Injection keys
 */
export const DIKeys = {
  // Repositories
  MANGA_REPOSITORY: 'mangaRepository',
  FAVORITE_REPOSITORY: 'favoriteRepository',
  HISTORY_REPOSITORY: 'historyRepository',
  COIN_REPOSITORY: 'coinRepository',
  TRANSACTION_REPOSITORY: 'transactionRepository',
  USER_REPOSITORY: 'userRepository',

  // DataSources
  MANGA_DATA_SOURCE: 'mangaDataSource',
  FAVORITE_DATA_SOURCE: 'favoriteDataSource',
  HISTORY_DATA_SOURCE: 'historyDataSource',
  COIN_DATA_SOURCE: 'coinDataSource',
  USER_DATA_SOURCE: 'userDataSource',

  // ViewModels
  HOME_VIEW_MODEL: 'homeViewModel',
  MANGA_DETAIL_VIEW_MODEL: 'mangaDetailViewModel',
  FAVORITES_VIEW_MODEL: 'favoritesViewModel',
  HISTORY_VIEW_MODEL: 'historyViewModel',
  COIN_STORE_VIEW_MODEL: 'coinStoreViewModel',
  COIN_BALANCE_VIEW_MODEL: 'coinBalanceViewModel',
  PROFILE_VIEW_MODEL: 'profileViewModel',
} as const;
