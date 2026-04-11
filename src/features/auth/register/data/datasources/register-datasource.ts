import { RegisterRequest, RegisterResponse } from '../../domain/entities/register-request';
import {
    IRegisterLocalDatasource,
    IRegisterRemoteDatasource,
} from '../datasources/register-datasource.interface';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';

export class RegisterLocalDatasource implements IRegisterLocalDatasource {
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async saveUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }
}

interface AuthResponse {
  token: string;
  role: string;
  userId: string;
}

export class RegisterRemoteDatasource implements IRegisterRemoteDatasource {
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/register', {
        email: request.email,
        username: request.username,
        password: request.password,
        role: request.role || 'ROLE_USER',
      });

      // Save auth data persistently
      await TokenStorageService.saveAuth(response.token, response.userId, response.role);

      const user = {
        id: response.userId,
        email: request.email,
        username: request.username,
        createdAt: new Date(),
      };

      return {
        user,
        token: response.token,
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }
}
