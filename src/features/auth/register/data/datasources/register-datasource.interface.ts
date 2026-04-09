import { RegisterRequest, RegisterResponse } from '../entities/register-request';

export interface IRegisterLocalDatasource {
  saveToken(token: string): Promise<void>;
  saveUser(user: any): Promise<void>;
}

export interface IRegisterRemoteDatasource {
  register(request: RegisterRequest): Promise<RegisterResponse>;
}
