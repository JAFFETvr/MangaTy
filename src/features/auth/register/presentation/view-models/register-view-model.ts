import { StateFlow } from '@/src/shared/hooks/use-state-flow';
import { RegisterUseCase } from '../../domain/use-cases/register-use-case';

export interface RegisterViewModelState {
  isLoading: boolean;
  error: string | null;
  user: any | null;
  isRegistered: boolean;
}

export class RegisterViewModel {
  private _state: StateFlow<RegisterViewModelState>;

  constructor(private registerUseCase: RegisterUseCase) {
    this._state = new StateFlow<RegisterViewModelState>({
      isLoading: false,
      error: null,
      user: null,
      isRegistered: false,
    });
  }

  get state(): StateFlow<RegisterViewModelState> {
    return this._state;
  }

  async register(username: string, email: string, password: string): Promise<void> {
    try {
      this._state.setValue({
        ...this._state.getValue(),
        isLoading: true,
        error: null,
      });

      const response = await this.registerUseCase.execute({
        username,
        email,
        password,
      });

      this._state.setValue({
        isLoading: false,
        error: null,
        user: response.user,
        isRegistered: true,
      });
    } catch (error) {
      this._state.setValue({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al registrarse',
        user: null,
        isRegistered: false,
      });
    }
  }
}

