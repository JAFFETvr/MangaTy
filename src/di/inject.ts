/**
 * Dependency Injection setup
 * This file initializes all repositories and ViewModels
 * Called IMMEDIATELY on module load, not in useEffect
 */

import { DIKeys, serviceLocator } from './service-locator';

let initialized = false;

/**
 * Setup all application dependencies
 * This is called immediately when the module loads
 */
export function setupDependencies(): void {
  if (initialized) {
    return;
  }

  try {
    // Manga feature
    const { MangaRemoteDataSource } = require('@/src/features/manga/data/datasources/manga-remote-datasource');
    const { MangaRepositoryImpl } = require('@/src/features/manga/data/repositories/manga-repository-impl');
    const { GetAllMangas, GetMangaDetail, SearchMangas } = require('@/src/features/manga/domain/use-cases');
    const { HomeViewModel, MangaDetailViewModel } = require('@/src/features/manga/presentation');
    const { ExploreCategoryViewModel } = require('@/src/features/explore/presentation/view-models/explore-category-view-model');

    const mangaRemoteDataSource = new MangaRemoteDataSource();
    const mangaRepository = new MangaRepositoryImpl(mangaRemoteDataSource);

    const getAllMangas = new GetAllMangas(mangaRepository);
    const getMangaDetail = new GetMangaDetail(mangaRepository);

    const homeViewModel = new HomeViewModel(getAllMangas);
    const mangaDetailViewModel = new MangaDetailViewModel(getMangaDetail);
    const exploreCategoryViewModel = new ExploreCategoryViewModel(getAllMangas);

    serviceLocator.registerSingleton(DIKeys.MANGA_REPOSITORY, () => mangaRepository);
    serviceLocator.registerSingleton(DIKeys.HOME_VIEW_MODEL, () => homeViewModel);
    serviceLocator.registerSingleton(DIKeys.MANGA_DETAIL_VIEW_MODEL, () => mangaDetailViewModel);
    serviceLocator.registerSingleton(DIKeys.EXPLORE_CATEGORY_VIEW_MODEL, () => exploreCategoryViewModel);

    // Favorites feature
    const { FavoriteLocalDataSource } = require('@/src/features/favorites/data/datasources/favorite-local-datasource');
    const { FavoriteRepositoryImpl } = require('@/src/features/favorites/data/repositories/favorite-repository-impl');
    const { GetFavorites, AddFavorite, RemoveFavorite } = require('@/src/features/favorites/domain/use-cases');
    const { FavoritesViewModel } = require('@/src/features/favorites/presentation');

    const favoriteDataSource = new FavoriteLocalDataSource();
    const favoriteRepository = new FavoriteRepositoryImpl(favoriteDataSource);

    const getFavorites = new GetFavorites(favoriteRepository);
    const addFavorite = new AddFavorite(favoriteRepository);
    const removeFavorite = new RemoveFavorite(favoriteRepository);

    const favoritesViewModel = new FavoritesViewModel(getFavorites, addFavorite, removeFavorite);

    serviceLocator.registerSingleton(DIKeys.FAVORITE_REPOSITORY, () => favoriteRepository);
    serviceLocator.registerSingleton(DIKeys.FAVORITES_VIEW_MODEL, () => favoritesViewModel);

    // History feature
    const { HistoryLocalDataSource } = require('@/src/features/history/data/datasources/history-local-datasource');
    const { HistoryRepositoryImpl } = require('@/src/features/history/data/repositories/history-repository-impl');
    const { GetHistory, AddToHistory, ClearHistory } = require('@/src/features/history/domain/use-cases');
    const { HistoryViewModel } = require('@/src/features/history/presentation');

    const historyDataSource = new HistoryLocalDataSource();
    const historyRepository = new HistoryRepositoryImpl(historyDataSource);

    const getHistory = new GetHistory(historyRepository);
    const addToHistory = new AddToHistory(historyRepository);
    const clearHistory = new ClearHistory(historyRepository);

    const historyViewModel = new HistoryViewModel(getHistory, addToHistory, clearHistory);

    serviceLocator.registerSingleton(DIKeys.HISTORY_REPOSITORY, () => historyRepository);
    serviceLocator.registerSingleton(DIKeys.HISTORY_VIEW_MODEL, () => historyViewModel);

    // Coins feature
    const { CoinLocalDataSource } = require('@/src/features/coins/data/datasources/coin-local-datasource');
    const { CoinRemoteDataSource } = require('@/src/features/coins/data/datasources/coin-remote-datasource');
    const { CoinRepositoryImpl } = require('@/src/features/coins/data/repositories/coin-repository-impl');
    const { GetCoinBalance, GetCoinPackages, PurchaseCoins, WatchAd, CreateCheckout } = require('@/src/features/coins/domain/use-cases');
    const { CoinStoreViewModel } = require('@/src/features/coins/presentation/view-models/coin-store-view-model');

    const coinLocalDataSource = new CoinLocalDataSource();
    const coinRemoteDataSource = new CoinRemoteDataSource();
    const coinRepository = new CoinRepositoryImpl(coinLocalDataSource, coinRemoteDataSource);

    const getCoinBalance = new GetCoinBalance(coinRepository);
    const getCoinPackages = new GetCoinPackages(coinRepository);
    const purchaseCoins = new PurchaseCoins(coinRepository);
    const watchAd = new WatchAd(coinRepository);
    const createCheckout = new CreateCheckout(coinRepository);

    const coinStoreViewModel = new CoinStoreViewModel(getCoinBalance, getCoinPackages, purchaseCoins, watchAd, createCheckout);

    serviceLocator.registerSingleton(DIKeys.COIN_REPOSITORY, () => coinRepository);
    serviceLocator.registerSingleton(DIKeys.CREATE_CHECKOUT, () => createCheckout);
    serviceLocator.registerSingleton(DIKeys.COIN_STORE_VIEW_MODEL, () => coinStoreViewModel);

    // User feature
    const { UserLocalDataSource } = require('@/src/features/user/data/datasources/user-local-datasource');
    const { UserRepositoryImpl } = require('@/src/features/user/data/repositories/user-repository-impl');
    const { GetUser, UpdateUser, Logout, SpendCoins, ValidateUserBalance, GetUserCoinBalance } = require('@/src/features/user/domain/use-cases');
    const { ProfileViewModel } = require('@/src/features/user/presentation');

    const userDataSource = new UserLocalDataSource();
    const userRepository = new UserRepositoryImpl(userDataSource);

    const getUser = new GetUser(userRepository);
    const updateUser = new UpdateUser(userRepository);
    const logout = new Logout(userRepository);
    const spendCoins = new SpendCoins(userRepository);
    const validateUserBalance = new ValidateUserBalance(userRepository);
    const getUserCoinBalance = new GetUserCoinBalance(userRepository);

    const profileViewModel = new ProfileViewModel(getUser, updateUser, logout);

    serviceLocator.registerSingleton(DIKeys.USER_REPOSITORY, () => userRepository);
    serviceLocator.registerSingleton(DIKeys.PROFILE_VIEW_MODEL, () => profileViewModel);
    serviceLocator.registerSingleton(DIKeys.SPEND_COINS, () => spendCoins);
    serviceLocator.registerSingleton(DIKeys.VALIDATE_USER_BALANCE, () => validateUserBalance);
    serviceLocator.registerSingleton(DIKeys.GET_USER_COIN_BALANCE, () => getUserCoinBalance);

    // Creators feature
    const { CreatorLocalDataSource } = require('@/src/features/creators/data/datasources/creator-local-data-source');
    const { CreatorRepository } = require('@/src/features/creators/data/repositories/creator-repository');
    const { GetCreatorById, GetCreatorMangas, GetCreatorEarnings, GetAllCreators } = require('@/src/features/creators/domain/use-cases');

    const creatorDataSource = new CreatorLocalDataSource();
    const creatorRepository = new CreatorRepository(creatorDataSource);

    const getCreatorById = new GetCreatorById(creatorRepository);
    const getCreatorMangas = new GetCreatorMangas(creatorRepository);
    const getCreatorEarnings = new GetCreatorEarnings(creatorRepository);
    const getAllCreators = new GetAllCreators(creatorRepository);

    const { CreatorViewModel } = require('@/src/features/creators/presentation/view-models/creator-view-model');
    const { ManageWebcomicViewModel } = require('@/src/features/creators/presentation/view-models/manage-webcomic-view-model');
    const { AnalyticsViewModel } = require('@/src/features/creators/presentation/view-models/analytics-view-model');
    const { CreateChapterViewModel } = require('@/src/features/creators/presentation/view-models/create-chapter-view-model');
    const { MonetizationViewModel } = require('@/src/features/creators/presentation/view-models/monetization-view-model');
    const { EditWebcomicViewModel } = require('@/src/features/creators/presentation/view-models/edit-webcomic-view-model');
    const { AccessConfigViewModel } = require('@/src/features/creators/presentation/view-models/access-config-view-model');
    const { FreeChaptersViewModel } = require('@/src/features/creators/presentation/view-models/free-chapters-view-model');
    const { ChapterPurchaseViewModel } = require('@/src/features/manga/presentation/view-models/chapter-purchase-view-model');

    const creatorViewModel = new CreatorViewModel(getCreatorById, getCreatorMangas, getCreatorEarnings, getAllCreators);
    const manageWebcomicViewModel = new ManageWebcomicViewModel(getMangaDetail);
    const analyticsViewModel = new AnalyticsViewModel(getMangaDetail);
    const createChapterViewModel = new CreateChapterViewModel();
    const monetizationViewModel = new MonetizationViewModel();
    const editWebcomicViewModel = new EditWebcomicViewModel(getMangaDetail);
    const accessConfigViewModel = new AccessConfigViewModel();
    const freeChaptersViewModel = new FreeChaptersViewModel(getMangaDetail);
    const chapterPurchaseViewModel = new ChapterPurchaseViewModel();

    serviceLocator.registerSingleton(DIKeys.CREATOR_REPOSITORY, () => creatorRepository);
    serviceLocator.registerSingleton(DIKeys.GET_CREATOR_BY_ID, () => getCreatorById);
    serviceLocator.registerSingleton(DIKeys.GET_CREATOR_MANGAS, () => getCreatorMangas);
    serviceLocator.registerSingleton(DIKeys.GET_CREATOR_EARNINGS, () => getCreatorEarnings);
    serviceLocator.registerSingleton(DIKeys.GET_ALL_CREATORS, () => getAllCreators);
    serviceLocator.registerSingleton(DIKeys.CREATOR_VIEW_MODEL, () => creatorViewModel);
    serviceLocator.registerSingleton(DIKeys.MANAGE_WEBCOMIC_VIEW_MODEL, () => manageWebcomicViewModel);
    serviceLocator.registerSingleton(DIKeys.ANALYTICS_VIEW_MODEL, () => analyticsViewModel);
    serviceLocator.registerSingleton(DIKeys.CREATE_CHAPTER_VIEW_MODEL, () => createChapterViewModel);
    serviceLocator.registerSingleton(DIKeys.MONETIZATION_VIEW_MODEL, () => monetizationViewModel);
    serviceLocator.registerSingleton(DIKeys.EDIT_WEBCOMIC_VIEW_MODEL, () => editWebcomicViewModel);
    serviceLocator.registerSingleton(DIKeys.ACCESS_CONFIG_VIEW_MODEL, () => accessConfigViewModel);
    serviceLocator.registerSingleton(DIKeys.FREE_CHAPTERS_VIEW_MODEL, () => freeChaptersViewModel);
    serviceLocator.registerSingleton(DIKeys.CHAPTER_PURCHASE_VIEW_MODEL, () => chapterPurchaseViewModel);

    // Unlocked Chapters feature
    const { UnlockedChapterLocalDataSource } = require('@/src/features/unlocked-chapters/data/datasources/UnlockedChapterLocalDataSource');
    const { UnlockedChapterRepository } = require('@/src/features/unlocked-chapters/data/repositories/UnlockedChapterRepository');
    const { UnlockChapterWithCoins, UnlockChapterWithAd, CheckChapterUnlocked, GetUnlockedChapters, UnlockChapterOrchestrator } = require('@/src/features/unlocked-chapters/domain/use-cases');

    const unlockedChapterDataSource = new UnlockedChapterLocalDataSource();
    const unlockedChapterRepository = new UnlockedChapterRepository(unlockedChapterDataSource);

    const unlockChapterWithCoins = new UnlockChapterWithCoins(unlockedChapterRepository);
    const unlockChapterWithAd = new UnlockChapterWithAd(unlockedChapterRepository);
    const checkChapterUnlocked = new CheckChapterUnlocked(unlockedChapterRepository);
    const getUnlockedChapters = new GetUnlockedChapters(unlockedChapterRepository);

    serviceLocator.registerSingleton(DIKeys.UNLOCKED_CHAPTER_REPOSITORY, () => unlockedChapterRepository);
    serviceLocator.registerSingleton(DIKeys.UNLOCK_CHAPTER_WITH_COINS, () => unlockChapterWithCoins);
    serviceLocator.registerSingleton(DIKeys.UNLOCK_CHAPTER_WITH_AD, () => unlockChapterWithAd);
    serviceLocator.registerSingleton(DIKeys.CHECK_CHAPTER_UNLOCKED, () => checkChapterUnlocked);
    serviceLocator.registerSingleton(DIKeys.GET_UNLOCKED_CHAPTERS, () => getUnlockedChapters);

    // Earnings feature
    const { EarningsLocalDataSource } = require('@/src/features/earnings/data/datasources/EarningsLocalDataSource');
    const { EarningsRepository } = require('@/src/features/earnings/data/repositories/EarningsRepository');
    const { RecordChapterPurchase, GetCreatorWallet, CalculatePendingPayout, GetCreatorEarningStats } = require('@/src/features/earnings/domain/use-cases');
    const { GetCreatorEarnings: GetCreatorEarningsUseCase } = require('@/src/features/earnings/domain/use-cases');

    const earningsDataSource = new EarningsLocalDataSource();
    const earningsRepository = new EarningsRepository(earningsDataSource);

    const recordChapterPurchase = new RecordChapterPurchase(earningsRepository);
    const getCreatorWallet = new GetCreatorWallet(earningsRepository);
    const calculatePendingPayout = new CalculatePendingPayout(earningsRepository);
    const getCreatorEarningStats = new GetCreatorEarningStats(earningsRepository);
    const getCreatorEarningsUseCase = new GetCreatorEarningsUseCase(earningsRepository);

    serviceLocator.registerSingleton(DIKeys.EARNINGS_REPOSITORY, () => earningsRepository);
    serviceLocator.registerSingleton(DIKeys.RECORD_CHAPTER_PURCHASE, () => recordChapterPurchase);
    serviceLocator.registerSingleton(DIKeys.GET_CREATOR_WALLET, () => getCreatorWallet);
    serviceLocator.registerSingleton(DIKeys.CALCULATE_PENDING_PAYOUT, () => calculatePendingPayout);
    serviceLocator.registerSingleton(DIKeys.GET_CREATOR_EARNING_STATS, () => getCreatorEarningStats);
    serviceLocator.registerSingleton(DIKeys.GET_CREATOR_EARNINGS, () => getCreatorEarningsUseCase);

    // Wallet feature
    const { WalletLocalDataSource } = require('@/src/features/wallet/data/datasources/WalletLocalDataSource');
    const { WalletRepository } = require('@/src/features/wallet/data/repositories/WalletRepository');
    const { GetTransactionHistory, GetWalletTransactions, GetWalletBalance, GetTransactionStats } = require('@/src/features/wallet/domain/use-cases');

    const walletDataSource = new WalletLocalDataSource();
    const walletRepository = new WalletRepository(walletDataSource);

    const getTransactionHistory = new GetTransactionHistory(walletRepository);
    const getWalletTransactions = new GetWalletTransactions(walletRepository);
    const getWalletBalance = new GetWalletBalance(userRepository);
    const getTransactionStats = new GetTransactionStats(walletRepository);

    serviceLocator.registerSingleton(DIKeys.WALLET_REPOSITORY, () => walletRepository);
    serviceLocator.registerSingleton(DIKeys.GET_TRANSACTION_HISTORY, () => getTransactionHistory);
    serviceLocator.registerSingleton(DIKeys.GET_WALLET_TRANSACTIONS, () => getWalletTransactions);
    serviceLocator.registerSingleton(DIKeys.GET_WALLET_BALANCE, () => getWalletBalance);
    serviceLocator.registerSingleton(DIKeys.GET_TRANSACTION_STATS, () => getTransactionStats);

    // Login feature
    const { LoginLocalDatasource, LoginRemoteDatasource } = require('@/src/features/auth/login/data/datasources/login-datasource');
    const { LoginRepository } = require('@/src/features/auth/login/data/repositories/login-repository');
    const { LoginUseCase } = require('@/src/features/auth/login/domain/use-cases/login-use-case');
    const { LoginViewModel } = require('@/src/features/auth/login/presentation/view-models/login-view-model');

    const loginLocalDatasource = new LoginLocalDatasource();
    const loginRemoteDatasource = new LoginRemoteDatasource();
    const loginRepository = new LoginRepository(loginRemoteDatasource, loginLocalDatasource);
    const loginUseCase = new LoginUseCase(loginRepository);
    const loginViewModel = new LoginViewModel(loginUseCase);

    serviceLocator.registerSingleton(DIKeys.LOGIN_REPOSITORY, () => loginRepository);
    serviceLocator.registerSingleton(DIKeys.LOGIN_VIEW_MODEL, () => loginViewModel);

    // Register feature
    const { RegisterLocalDatasource, RegisterRemoteDatasource } = require('@/src/features/auth/register/data/datasources/register-datasource');
    const { RegisterRepository } = require('@/src/features/auth/register/data/repositories/register-repository');
    const { RegisterUseCase } = require('@/src/features/auth/register/domain/use-cases/register-use-case');
    const { RegisterViewModel } = require('@/src/features/auth/register/presentation/view-models/register-view-model');

    const registerLocalDatasource = new RegisterLocalDatasource();
    const registerRemoteDatasource = new RegisterRemoteDatasource();
    const registerRepository = new RegisterRepository(registerRemoteDatasource, registerLocalDatasource);
    const registerUseCase = new RegisterUseCase(registerRepository);
    const registerViewModel = new RegisterViewModel(registerUseCase);

    serviceLocator.registerSingleton(DIKeys.REGISTER_REPOSITORY, () => registerRepository);
    serviceLocator.registerSingleton(DIKeys.REGISTER_VIEW_MODEL, () => registerViewModel);

    // Unlock Chapter Orchestrator - El corazón del negocio
    const unlockChapterOrchestrator = new UnlockChapterOrchestrator(
      userRepository,
      unlockedChapterRepository,
      earningsRepository,
      walletRepository,
      creatorRepository
    );

    serviceLocator.registerSingleton(DIKeys.UNLOCK_CHAPTER_ORCHESTRATOR, () => unlockChapterOrchestrator);

    initialized = true;
  } catch (error) {
    console.error('❌ Error during dependency initialization:', error);
    throw error;
  }
}

// Initialize immediately on module load
setupDependencies();
