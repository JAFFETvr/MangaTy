import { LoginRequest, LoginResponse, User } from '../entities/user';

export interface ILoginLocalDatasource {
  saveToken(token: string): Promise<void>;
  getToken(): Promise<string | null>;
  removeToken(): Promise<void>;
  saveUser(user: User): Promise<void>;
  getUser(): Promise<User | null>;
  removeUser(): Promise<void>;
}

export interface ILoginRemoteDatasource {
  login(request: LoginRequest): Promise<LoginResponse>;
}
