/**
 * User Remote DataSource
 * Fetches user data from the backend API
 */

import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { UPLOADS_BASE } from '@/src/core/api/api-config';
import { STORAGE_KEY_EMAIL } from '@/src/features/auth/login/presentation/view-models/login-view-model';
import { STORAGE_KEY_USERNAME } from '@/src/features/auth/register/presentation/view-models/register-view-model';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User } from '../../domain/entities';

interface WalletBalance {
  userId: string;
  tyCoins: number;
}

interface UserProfileResponse {
  id?: string;
  userId?: string;
  email?: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  avatar_url?: string;
  avatarPath?: string;
  avatar_path?: string;
}

export class UserRemoteDataSource {
  private readonly profileEndpoints = ['/users/me', '/user/me', '/auth/me', '/auth/profile', '/profile'];
  private readonly avatarUploadEndpoint = '/users/me/avatar';

  private resolveAvatarUrl(value?: string | null): string | null {
    if (!value) return null;
    if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('file://') || value.startsWith('blob:')) {
      return value;
    }
    const normalizedPath = value
      .replace(/^\/+/, '')
      .replace(/^uploads\/+/i, '');
    return `${UPLOADS_BASE}${normalizedPath}`;
  }

  private async getRemoteProfile(): Promise<UserProfileResponse | null> {
    for (const endpoint of this.profileEndpoints) {
      try {
        const profile = await httpClient.get<UserProfileResponse>(endpoint);
        if (profile && typeof profile === 'object') {
          return profile;
        }
      } catch {
        // Ignorar endpoints que no existan en backend y probar el siguiente
      }
    }
    return null;
  }

  async uploadAvatar(imageUri: string): Promise<string> {
    const token = await TokenStorageService.getToken();
    if (token) {
      httpClient.setToken(token);
    }

    const extractAvatarRaw = (response: any): string | undefined =>
      response?.avatarUrl ||
      response?.avatar_url ||
      response?.avatarPath ||
      response?.avatar_path ||
      response?.avatar ||
      response?.url;

    const buildFormData = async (fieldName: 'file' | 'avatar'): Promise<FormData> => {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append(fieldName, blob, 'avatar.jpg');
      } else {
        const filePayload = {
          uri: imageUri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any;
        formData.append(fieldName, filePayload);
      }
      return formData;
    };

    try {
      let uploadResponse: any = null;
      try {
        const formData = await buildFormData('file');
        uploadResponse = await httpClient.postFormData<any>(this.avatarUploadEndpoint, formData);
      } catch {
        const fallbackFormData = await buildFormData('avatar');
        uploadResponse = await httpClient.postFormData<any>(this.avatarUploadEndpoint, fallbackFormData);
      }

      const avatarFromUpload = this.resolveAvatarUrl(extractAvatarRaw(uploadResponse));
      if (avatarFromUpload) return avatarFromUpload;

      // Algunos backends devuelven 200/204 sin body; recargar perfil para obtener avatar actualizado.
      const refreshedProfile = await this.getRemoteProfile();
      const avatarFromProfile = this.resolveAvatarUrl(extractAvatarRaw(refreshedProfile));
      if (avatarFromProfile) return avatarFromProfile;

      throw new Error('La subida se realizó, pero no se pudo leer el avatar actualizado desde el perfil');
    } catch (error) {
      const backendMessage =
        error instanceof Error ? error.message : 'No se pudo subir la foto de perfil al backend';
      throw new Error(
        `Error al subir avatar en ${this.avatarUploadEndpoint}. ${backendMessage}.`
      );
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const payloads = [
      { currentPassword, newPassword },
      { oldPassword: currentPassword, newPassword },
    ];
    let lastError: unknown = null;
    for (const payload of payloads) {
      try {
        await httpClient.post('/auth/change-password', payload);
        return;
      } catch (error) {
        lastError = error;
        // Intentar variante de payload si la primera falla
      }
    }

    throw lastError instanceof Error ? lastError : new Error('No se pudo cambiar la contraseña');
  }

  async getUser(): Promise<User | null> {
    try {
      const auth = await TokenStorageService.getAuth();
      if (!auth) {
        return null;
      }

      const remoteProfile = await this.getRemoteProfile();

      // Obtener username y email guardados
      let username = await AsyncStorage.getItem(STORAGE_KEY_USERNAME);
      const email = await AsyncStorage.getItem(STORAGE_KEY_EMAIL);
      username = remoteProfile?.username || remoteProfile?.name || username;
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
      const avatarRaw = remoteProfile?.avatarUrl || remoteProfile?.avatar_url || remoteProfile?.avatarPath || remoteProfile?.avatar_path;
      const profileEmail = remoteProfile?.email || email || '';

      return {
        id: remoteProfile?.id || remoteProfile?.userId || auth.userId,
        name: username || 'Mi Perfil',
        email: profileEmail,
        avatarUrl: this.resolveAvatarUrl(avatarRaw),
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
