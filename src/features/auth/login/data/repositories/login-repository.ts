import { LoginRequest, LoginResponse, User } from '../../domain/entities/user';
import { ILoginRepository } from '../../domain/repositories/login-repository.interface';
import {
    ILoginLocalDatasource,
    ILoginRemoteDatasource,
} from '../datasources/login-datasource.interface';

export class LoginRepository implements ILoginRepository {
  constructor(
    private remoteDatasource: ILoginRemoteDatasource,
    private localDatasource: ILoginLocalDatasource,
  ) {}

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await this.remoteDatasource.login(request);
    await this.localDatasource.saveToken(response.token);
    await this.localDatasource.saveUser(response.user);
    return response;
  }

  async logout(): Promise<void> {
    await this.localDatasource.removeToken();
    await this.localDatasource.removeUser();
  }

  async getCurrentUser(): Promise<User | null> {
    return await this.localDatasource.getUser();
  }
}
