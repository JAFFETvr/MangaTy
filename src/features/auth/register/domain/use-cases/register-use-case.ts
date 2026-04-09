import { RegisterRequest, RegisterResponse } from '../entities/register-request';
import { IRegisterRepository } from '../repositories/register-repository.interface';

export class RegisterUseCase {
  constructor(private repository: IRegisterRepository) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    if (!request.username || !request.email || !request.password) {
      throw new Error('Todos los campos son requeridos');
    }

    if (request.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    return await this.repository.register(request);
  }
}
