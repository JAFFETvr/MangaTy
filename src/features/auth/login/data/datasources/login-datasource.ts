import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, LoginResponse, User } from '../../domain/entities/user';
import {
    ILoginLocalDatasource,
    ILoginRemoteDatasource,
} from '../datasources/login-datasource.interface';

export class LoginLocalDatasource implements ILoginLocalDatasource {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.tokenKey);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const user = await AsyncStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  }

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.userKey);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }
}

interface AuthResponse {
  token: string;
  role: string;
  userId: string;
}

export class LoginRemoteDatasource implements ILoginRemoteDatasource {
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<AuthResponse>(
        '/auth/login',
        {
          email: request.email,
          password: request.password,
        },
        { skipAuth: true }
      );

      // Save auth data persistently
      await TokenStorageService.saveAuth(response.token, response.userId, response.role);

      const user: User = {
        id: response.userId,
        email: request.email,
        username: request.email.split('@')[0],
        createdAt: new Date(),
      };

      return {
        user,
        token: response.token,
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }
}
