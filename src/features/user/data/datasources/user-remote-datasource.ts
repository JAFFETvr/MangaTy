/**
 * User Remote DataSource
 * Fetches user data from the backend API
 */

import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { STORAGE_KEY_EMAIL } from '@/src/features/auth/login/presentation/view-models/login-view-model';
import { STORAGE_KEY_USERNAME } from '@/src/features/auth/register/presentation/view-models/register-view-model';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../domain/entities';

interface WalletBalance {
  userId: string;
  tyCoins: number;
}

export class UserRemoteDataSource {
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const endpoints = ['/auth/change-password', '/users/change-password', '/user/change-password'];
    const payloads = [
      { currentPassword, newPassword },
      { oldPassword: currentPassword, newPassword },
    ];
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        try {
          await httpClient.post(endpoint, payload);
          return;
        } catch (error) {
          lastError = error;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('No se pudo cambiar la contraseña');
  }

  async getUser(): Promise<User | null> {
    try {
      const auth = await TokenStorageService.getAuth();
      if (!auth) {
        return null;
      }

      // Obtener username y email guardados
      let username = await AsyncStorage.getItem(STORAGE_KEY_USERNAME);
      const email = await AsyncStorage.getItem(STORAGE_KEY_EMAIL);
      if (!username) {
        const rawAuthUser = await AsyncStorage.getItem('auth_user');
        if (rawAuthUser) {
          try {
            const parsed = JSON.parse(rawAuthUser);
            if (parsed?.username && typeof parsed.username === 'string') {
              username = parsed.username;
            }
          } catch (error) {
            console.warn('⚠️ auth_user inválido en storage:', error);
          }
        }
      }
      if (!username && email) {
        username = email.split('@')[0];
      }
      if (username) {
        await AsyncStorage.setItem(STORAGE_KEY_USERNAME, username);
      }

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
    if (updates.name) {
      await AsyncStorage.setItem(STORAGE_KEY_USERNAME, updates.name);
    }
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
