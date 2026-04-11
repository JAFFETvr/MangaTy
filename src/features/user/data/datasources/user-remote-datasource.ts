/**
 * User Remote DataSource
 * Fetches user data from the backend API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../domain/entities';
import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { STORAGE_KEY_USERNAME } from '@/src/features/auth/register/presentation/view-models/register-view-model';
import { STORAGE_KEY_EMAIL } from '@/src/features/auth/login/presentation/view-models/login-view-model';

interface WalletBalance {
  userId: string;
  tyCoins: number;
}

export class UserRemoteDataSource {
  async getUser(): Promise<User | null> {
    try {
      const auth = await TokenStorageService.getAuth();
      if (!auth) {
        return null;
      }

      // Obtener username y email guardados desde el registro
      const username = await AsyncStorage.getItem(STORAGE_KEY_USERNAME);
      const email = await AsyncStorage.getItem(STORAGE_KEY_EMAIL);

      // Fetch wallet balance to get user's TyCoins
      const balance = await httpClient.get<WalletBalance>('/wallet/balance');

      return {
        id: auth.userId,
        name: username || 'Mi Perfil',
        email: email || '',
        coinBalance: balance.tyCoins,
        memberSince: new Date(),
        stats: {
          mangasRead: 0,
          favorites: 0,
          chaptersRead: 0,
        },
      };
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    // For now, just return the updated user
    // In a real scenario, you'd POST to an update endpoint
    const current = await this.getUser();
    return { ...current, ...updates } as User;
  }

  async getUserCoinBalance(): Promise<number> {
    try {
      const balance = await httpClient.get<WalletBalance>('/wallet/balance');
      return balance.tyCoins;
    } catch (error) {
      console.error('❌ Error fetching coin balance:', error);
      throw error;
    }
  }

  async addCoins(amount: number): Promise<number> {
    // Coins are added via the payment webhook (automatic)
    // This method just fetches the current balance
    return this.getUserCoinBalance();
  }

  async spendCoins(amount: number): Promise<number> {
    // Coins are spent via POST /wallet/unlock (handled elsewhere)
    // This method just fetches the current balance
    return this.getUserCoinBalance();
  }

  async logout(): Promise<void> {
    try {
      // Clear auth data
      await TokenStorageService.clearAuth();
    } catch (error) {
      console.error('❌ Error logging out:', error);
      throw error;
    }
  }
}
