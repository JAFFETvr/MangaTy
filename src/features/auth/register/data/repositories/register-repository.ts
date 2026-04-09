import { RegisterRequest, RegisterResponse } from '../../domain/entities/register-request';
import { IRegisterRepository } from '../../domain/repositories/register-repository.interface';
import {
    IRegisterLocalDatasource,
    IRegisterRemoteDatasource,
} from '../datasources/register-datasource.interface';

export class RegisterRepository implements IRegisterRepository {
  constructor(
    private remoteDatasource: IRegisterRemoteDatasource,
    private localDatasource: IRegisterLocalDatasource,
  ) {}

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.remoteDatasource.register(request);
    await this.localDatasource.saveToken(response.token);
    await this.localDatasource.saveUser(response.user);
    return response;
  }
}
