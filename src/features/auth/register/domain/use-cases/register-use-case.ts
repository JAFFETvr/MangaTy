import { RegisterRequest, RegisterResponse } from '../entities/register-request';
import { IRegisterRepository } from '../repositories/register-repository.interface';

export class RegisterUseCase {
  constructor(private repository: IRegisterRepository) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    if (!request.username || !request.email || !request.password) {
      throw new Error('Todos los campos son requeridos');
    }

    // Validar username (3-100 caracteres)
    if (request.username.length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
    }
    if (request.username.length > 100) {
      throw new Error('El nombre de usuario no puede exceder 100 caracteres');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Por favor ingresa un correo válido');
    }

    // Validar password (mínimo 8 caracteres para cumplir con backend)
    if (request.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    return await this.repository.register(request);
  }
}
