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
    const { MangaLocalDataSource } = require('@/src/features/manga/data/datasources/manga-local-datasource');
    const { MangaRepositoryImpl } = require('@/src/features/manga/data/repositories/manga-repository-impl');
    const { GetAllMangas, GetMangaById, SearchMangas } = require('@/src/features/manga/domain/use-cases');
    const { HomeViewModel, MangaDetailViewModel } = require('@/src/features/manga/presentation');

    const mangaDataSource = new MangaLocalDataSource();
    const mangaRepository = new MangaRepositoryImpl(mangaDataSource);

    const getAllMangas = new GetAllMangas(mangaRepository);
    const getMangaById = new GetMangaById(mangaRepository);
    const searchMangas = new SearchMangas(mangaRepository);

    const homeViewModel = new HomeViewModel(getAllMangas, searchMangas);
    const mangaDetailViewModel = new MangaDetailViewModel(getMangaById);

    serviceLocator.registerSingleton(DIKeys.MANGA_REPOSITORY, () => mangaRepository);
    serviceLocator.registerSingleton(DIKeys.HOME_VIEW_MODEL, () => homeViewModel);
    serviceLocator.registerSingleton(DIKeys.MANGA_DETAIL_VIEW_MODEL, () => mangaDetailViewModel);

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
    const { CoinRepositoryImpl } = require('@/src/features/coins/data/repositories/coin-repository-impl');
    const { GetCoinBalance, GetCoinPackages, PurchaseCoins, WatchAd } = require('@/src/features/coins/domain/use-cases');
    const { CoinStoreViewModel } = require('@/src/features/coins/presentation');

    const coinDataSource = new CoinLocalDataSource();
    const coinRepository = new CoinRepositoryImpl(coinDataSource);

    const getCoinBalance = new GetCoinBalance(coinRepository);
    const getCoinPackages = new GetCoinPackages(coinRepository);
    const purchaseCoins = new PurchaseCoins(coinRepository);
    const watchAd = new WatchAd(coinRepository);

    const coinStoreViewModel = new CoinStoreViewModel(getCoinBalance, getCoinPackages, purchaseCoins, watchAd);

    serviceLocator.registerSingleton(DIKeys.COIN_REPOSITORY, () => coinRepository);
    serviceLocator.registerSingleton(DIKeys.COIN_STORE_VIEW_MODEL, () => coinStoreViewModel);

    // User feature
    const { UserLocalDataSource } = require('@/src/features/user/data/datasources/user-local-datasource');
    const { UserRepositoryImpl } = require('@/src/features/user/data/repositories/user-repository-impl');
    const { GetUser, UpdateUser, Logout } = require('@/src/features/user/domain/use-cases');
    const { ProfileViewModel } = require('@/src/features/user/presentation');

    const userDataSource = new UserLocalDataSource();
    const userRepository = new UserRepositoryImpl(userDataSource);

    const getUser = new GetUser(userRepository);
    const updateUser = new UpdateUser(userRepository);
    const logout = new Logout(userRepository);

    const profileViewModel = new ProfileViewModel(getUser, updateUser, logout);

    serviceLocator.registerSingleton(DIKeys.USER_REPOSITORY, () => userRepository);
    serviceLocator.registerSingleton(DIKeys.PROFILE_VIEW_MODEL, () => profileViewModel);

    initialized = true;
  } catch (error) {
    console.error('❌ Error during dependency initialization:', error);
    throw error;
  }
}

// Initialize immediately on module load
setupDependencies();
