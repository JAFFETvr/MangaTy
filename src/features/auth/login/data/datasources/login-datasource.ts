import { LoginRequest, LoginResponse, User } from '../../domain/entities/user';
import {
    ILoginLocalDatasource,
    ILoginRemoteDatasource,
} from '../datasources/login-datasource.interface';

export class LoginLocalDatasource implements ILoginLocalDatasource {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  async saveToken(token: string): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.log('Token saved:', token);
  }

  async getToken(): Promise<string | null> {
    // TODO: Implement with AsyncStorage
    return null;
  }

  async removeToken(): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.log('Token removed');
  }

  async saveUser(user: User): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.log('User saved:', user);
  }

  async getUser(): Promise<User | null> {
    // TODO: Implement with AsyncStorage
    return null;
  }

  async removeUser(): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.log('User removed');
  }
}

export class LoginRemoteDatasource implements ILoginRemoteDatasource {
  async login(request: LoginRequest): Promise<LoginResponse> {
    // TODO: Implement with actual API call
    // Mock response for now
    const mockUser: User = {
      id: '1',
      email: request.email,
      username: request.email.split('@')[0],
      createdAt: new Date(),
    };

    return {
      user: mockUser,
      token: 'mock_token_' + Date.now(),
    };
  }
}
