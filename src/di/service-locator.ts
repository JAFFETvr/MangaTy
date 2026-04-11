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
  CREATOR_REPOSITORY: 'creatorRepository',
  UNLOCKED_CHAPTER_REPOSITORY: 'unlockedChapterRepository',
  EARNINGS_REPOSITORY: 'earningsRepository',
  WALLET_REPOSITORY: 'walletRepository',
  LOGIN_REPOSITORY: 'loginRepository',
  REGISTER_REPOSITORY: 'registerRepository',

  // DataSources
  MANGA_DATA_SOURCE: 'mangaDataSource',
  FAVORITE_DATA_SOURCE: 'favoriteDataSource',
  HISTORY_DATA_SOURCE: 'historyDataSource',
  COIN_DATA_SOURCE: 'coinDataSource',
  COIN_REMOTE_DATA_SOURCE: 'coinRemoteDataSource',
  USER_DATA_SOURCE: 'userDataSource',

  // ViewModels
  HOME_VIEW_MODEL: 'homeViewModel',
  MANGA_DETAIL_VIEW_MODEL: 'mangaDetailViewModel',
  FAVORITES_VIEW_MODEL: 'favoritesViewModel',
  HISTORY_VIEW_MODEL: 'historyViewModel',
  COIN_STORE_VIEW_MODEL: 'coinStoreViewModel',
  COIN_BALANCE_VIEW_MODEL: 'coinBalanceViewModel',
  PROFILE_VIEW_MODEL: 'profileViewModel',
  UNLOCK_CHAPTER_VIEW_MODEL: 'unlockChapterViewModel',
  CREATOR_VIEW_MODEL: 'creatorViewModel',
  EARNINGS_VIEW_MODEL: 'earningsViewModel',
  WALLET_VIEW_MODEL: 'walletViewModel',
  LOGIN_VIEW_MODEL: 'loginViewModel',
  REGISTER_VIEW_MODEL: 'registerViewModel',
  EXPLORE_CATEGORY_VIEW_MODEL: 'exploreCategoryViewModel',
  MANAGE_WEBCOMIC_VIEW_MODEL: 'manageWebcomicViewModel',
  CREATE_CHAPTER_VIEW_MODEL: 'createChapterViewModel',
  ANALYTICS_VIEW_MODEL: 'analyticsViewModel',
  MONETIZATION_VIEW_MODEL: 'monetizationViewModel',
  EDIT_WEBCOMIC_VIEW_MODEL: 'editWebcomicViewModel',
  ACCESS_CONFIG_VIEW_MODEL: 'accessConfigViewModel',
  FREE_CHAPTERS_VIEW_MODEL: 'freeChaptersViewModel',
  CHAPTER_PURCHASE_VIEW_MODEL: 'chapterPurchaseViewModel',

  // User Use Cases
  SPEND_COINS: 'spendCoins',
  VALIDATE_USER_BALANCE: 'validateUserBalance',
  GET_USER_COIN_BALANCE: 'getUserCoinBalance',
  CREATE_CHECKOUT: 'createCheckout',

  // Creator Use Cases
  GET_CREATOR_BY_ID: 'getCreatorById',
  GET_CREATOR_MANGAS: 'getCreatorMangas',
  GET_CREATOR_EARNINGS: 'getCreatorEarnings',
  GET_ALL_CREATORS: 'getAllCreators',

  // Unlocked Chapters Use Cases
  UNLOCK_CHAPTER_WITH_COINS: 'unlockChapterWithCoins',
  UNLOCK_CHAPTER_WITH_AD: 'unlockChapterWithAd',
  CHECK_CHAPTER_UNLOCKED: 'checkChapterUnlocked',
  GET_UNLOCKED_CHAPTERS: 'getUnlockedChapters',

  // Earnings Use Cases
  RECORD_CHAPTER_PURCHASE: 'recordChapterPurchase',
  GET_CREATOR_WALLET: 'getCreatorWallet',
  CALCULATE_PENDING_PAYOUT: 'calculatePendingPayout',
  GET_CREATOR_EARNING_STATS: 'getCreatorEarningStats',

  // Wallet Use Cases
  GET_TRANSACTION_HISTORY: 'getTransactionHistory',
  GET_WALLET_TRANSACTIONS: 'getWalletTransactions',
  GET_WALLET_BALANCE: 'getWalletBalance',
  GET_TRANSACTION_STATS: 'getTransactionStats',

  // Orchestrators
  UNLOCK_CHAPTER_ORCHESTRATOR: 'unlockChapterOrchestrator',
} as const;
