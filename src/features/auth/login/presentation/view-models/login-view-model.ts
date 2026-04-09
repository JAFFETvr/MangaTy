import { StateFlow } from '@/src/shared/hooks/use-state-flow';
import { LoginUseCase } from '../../domain/use-cases/login-use-case';

export interface LoginViewModelState {
  isLoading: boolean;
  error: string | null;
  user: any | null;
  isAuthenticated: boolean;
}

export class LoginViewModel {
  private _state: StateFlow<LoginViewModelState>;

  constructor(private loginUseCase: LoginUseCase) {
    this._state = new StateFlow<LoginViewModelState>({
      isLoading: false,
      error: null,
      user: null,
      isAuthenticated: false,
    });
  }

  get state(): StateFlow<LoginViewModelState> {
    return this._state;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      this._state.setValue({
        ...this._state.getValue(),
        isLoading: true,
        error: null,
      });

      const response = await this.loginUseCase.execute({
        email,
        password,
      });

      this._state.setValue({
        isLoading: false,
        error: null,
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      this._state.setValue({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
        user: null,
        isAuthenticated: false,
      });
    }
  }

  async logout(): Promise<void> {
    this._state.setValue({
      isLoading: false,
      error: null,
      user: null,
      isAuthenticated: false,
    });
  }
}

