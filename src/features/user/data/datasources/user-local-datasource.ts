/**
 * User Local DataSource
 */

import { STORAGE_KEY_EMAIL } from '@/src/features/auth/login/presentation/view-models/login-view-model';
import { STORAGE_KEY_USERNAME } from '@/src/features/auth/register/presentation/view-models/register-view-model';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../domain/entities';

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

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!currentPassword || !newPassword) {
      throw new Error('Debes completar ambos campos de contraseña');
    }
    if (currentPassword === newPassword) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }
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
    await AsyncStorage.multiRemove([STORAGE_KEY_USERNAME, STORAGE_KEY_EMAIL]);
  }
}
