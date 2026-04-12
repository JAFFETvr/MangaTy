import { LoginRequest, LoginResponse } from '../entities/user';

export interface ILoginRepository {
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
