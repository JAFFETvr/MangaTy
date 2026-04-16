import { STORAGE_KEY_EMAIL } from '@/src/features/auth/login/presentation/view-models/login-view-model';
import { getUsernameByUserIdStorageKey } from '@/src/core/storage/local-webcomic-storage';
import { StateFlow } from '@/src/shared/hooks/use-state-flow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterUseCase } from '../../domain/use-cases/register-use-case';

export const STORAGE_KEY_USERNAME = '@mangaty_username';

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

  async register(
    username: string,
    email: string,
    password: string,
    role: 'ROLE_USER' | 'ROLE_CREATOR'
  ): Promise<void> {
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
        role,
      });

      // Persistir username y email para el perfil
      await AsyncStorage.setItem(STORAGE_KEY_USERNAME, username);
      await AsyncStorage.setItem(STORAGE_KEY_EMAIL, email);
      if (response.user?.id) {
        await AsyncStorage.setItem(getUsernameByUserIdStorageKey(String(response.user.id)), username);
      }

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
