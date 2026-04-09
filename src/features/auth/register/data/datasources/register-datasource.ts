import { RegisterRequest, RegisterResponse } from '../../domain/entities/register-request';
import {
    IRegisterLocalDatasource,
    IRegisterRemoteDatasource,
} from '../datasources/register-datasource.interface';

export class RegisterLocalDatasource implements IRegisterLocalDatasource {
  async saveToken(token: string): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.log('Token saved:', token);
  }

  async saveUser(user: any): Promise<void> {
    // TODO: Implement with AsyncStorage
    console.log('User saved:', user);
  }
}

export class RegisterRemoteDatasource implements IRegisterRemoteDatasource {
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    // TODO: Implement with actual API call
    // Mock response for now
    const mockUser = {
      id: Date.now().toString(),
      email: request.email,
      username: request.username,
      createdAt: new Date(),
    };

    return {
      user: mockUser,
      token: 'mock_token_' + Date.now(),
    };
  }
}
