/**
 * Token Storage Service
 * Manages JWT token persistence in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from '../http/http-client';

const TOKEN_KEY = '@mangaty_auth_token';
const USER_ID_KEY = '@mangaty_user_id';
const ROLE_KEY = '@mangaty_user_role';

export interface StoredAuth {
  token: string;
  userId: string;
  role: string;
}

export class TokenStorageService {
  /**
   * Save auth data to AsyncStorage and set HTTP client token
   */
  static async saveAuth(token: string, userId: string, role: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [USER_ID_KEY, userId],
        [ROLE_KEY, role],
      ]);
      httpClient.setToken(token);
    } catch (error) {
      console.error('❌ Error saving auth:', error);
      throw error;
    }
  }

  /**
   * Retrieve stored auth data
   */
  static async getAuth(): Promise<StoredAuth | null> {
    try {
      const values = await AsyncStorage.multiGet([TOKEN_KEY, USER_ID_KEY, ROLE_KEY]);
      const [tokenPair, userIdPair, rolePair] = values;

      if (!tokenPair[1] || !userIdPair[1] || !rolePair[1]) {
        return null;
      }

      return {
        token: tokenPair[1],
        userId: userIdPair[1],
        role: rolePair[1],
      };
    } catch (error) {
      console.error('❌ Error retrieving auth:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const auth = await this.getAuth();
    return !!auth;
  }

  /**
   * Clear all auth data (logout)
   */
  static async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY, ROLE_KEY]);
      httpClient.clearToken();
    } catch (error) {
      console.error('❌ Error clearing auth:', error);
      throw error;
    }
  }

  /**
   * Get just the token (useful for HTTP client)
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  /**
   * Get user ID
   */
  static async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_ID_KEY);
    } catch (error) {
      console.error('❌ Error getting userId:', error);
      return null;
    }
  }

  /**
   * Get user role
   */
  static async getRole(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ROLE_KEY);
    } catch (error) {
      console.error('❌ Error getting role:', error);
      return null;
    }
  }

  /**
   * Initialize HTTP client with stored token (call on app startup)
   */
  static async initializeHttpClient(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        httpClient.setToken(token);
      }
    } catch (error) {
      console.error('❌ Error initializing HTTP client:', error);
    }
  }
}
