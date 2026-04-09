import { RegisterRequest, RegisterResponse } from '../entities/register-request';

export interface IRegisterRepository {
  register(request: RegisterRequest): Promise<RegisterResponse>;
}
