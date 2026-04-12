/**
 * User Local DataSource
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../domain/entities';
import { STORAGE_KEY_USERNAME } from '@/src/features/auth/register/presentation/view-models/register-view-model';
import { STORAGE_KEY_EMAIL } from '@/src/features/auth/login/presentation/view-models/login-view-model';

export class UserLocalDataSource {
  private user: User = {
    id: '1',
    name: 'Usuario',
    email: '',
    coinBalance: 0,
    memberSince: new Date(),
    stats: {
      mangasRead: 0,
      favorites: 0,
      chaptersRead: 0,
    },
  };

  async getUser(): Promise<User | null> {
    // Leer nombre y email guardados al registrarse/iniciar sesión
    try {
      const [savedUsername, savedEmail] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_USERNAME),
        AsyncStorage.getItem(STORAGE_KEY_EMAIL),
      ]);
      if (savedUsername) this.user.name = savedUsername;
      if (savedEmail) this.user.email = savedEmail;
    } catch {
      // Si falla AsyncStorage, dejamos los valores por defecto
    }
    return { ...this.user };
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    this.user = { ...this.user, ...updates };
    return { ...this.user };
  }

  async getUserCoinBalance(): Promise<number> {
    return this.user.coinBalance;
  }

  async addCoins(amount: number): Promise<number> {
    this.user.coinBalance += amount;
    return this.user.coinBalance;
  }

  async spendCoins(amount: number): Promise<number> {
    if (this.user.coinBalance < amount) {
      throw new Error('Saldo insuficiente');
    }
    this.user.coinBalance -= amount;
    return this.user.coinBalance;
  }

  async logout(): Promise<void> {
    // Limpiar el username al cerrar sesión
    await AsyncStorage.removeItem(STORAGE_KEY_USERNAME);
  }
}

