import { LoginRequest, LoginResponse } from '../entities/user';
import { ILoginRepository } from '../repositories/login-repository.interface';

export class LoginUseCase {
  constructor(private repository: ILoginRepository) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    if (!request.email || !request.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    return await this.repository.login(request);
  }
}
