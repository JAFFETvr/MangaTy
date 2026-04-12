import { LoginLocalDatasource, LoginRemoteDatasource } from '../login/data/datasources/login-datasource';
import { LoginRepository } from '../login/data/repositories/login-repository';
import { LoginUseCase } from '../login/domain/use-cases/login-use-case';
import { LoginViewModel } from '../login/presentation/view-models/login-view-model';

import { RegisterLocalDatasource, RegisterRemoteDatasource } from '../register/data/datasources/register-datasource';
import { RegisterRepository } from '../register/data/repositories/register-repository';
import { RegisterUseCase } from '../register/domain/use-cases/register-use-case';
import { RegisterViewModel } from '../register/presentation/view-models/register-view-model';

class AuthDIContainer {
  private static loginViewModel: LoginViewModel | null = null;
  private static registerViewModel: RegisterViewModel | null = null;

  static getLoginViewModel(): LoginViewModel {
    if (!this.loginViewModel) {
      const localDs = new LoginLocalDatasource();
      const remoteDs = new LoginRemoteDatasource();
      const repo = new LoginRepository(remoteDs, localDs);
      const useCase = new LoginUseCase(repo);
      this.loginViewModel = new LoginViewModel(useCase);
    }
    return this.loginViewModel;
  }

  static getRegisterViewModel(): RegisterViewModel {
    if (!this.registerViewModel) {
      const localDs = new RegisterLocalDatasource();
      const remoteDs = new RegisterRemoteDatasource();
      const repo = new RegisterRepository(remoteDs, localDs);
      const useCase = new RegisterUseCase(repo);
      this.registerViewModel = new RegisterViewModel(useCase);
    }
    return this.registerViewModel;
  }
}

export const AuthDI = AuthDIContainer;
