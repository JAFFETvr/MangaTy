/**
 * ProfileViewModel
 */

import { StateFlow } from '@/src/shared/hooks';
import { User } from '../../domain/entities';
import { GetUser, Logout, UpdateUser } from '../../domain/use-cases';

export interface ProfileViewModelState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileViewModelState = {
  user: null,
  isLoading: false,
  error: null,
};

export class ProfileViewModel {
  private stateSubject = new StateFlow<ProfileViewModelState>(initialState);
  state$ = this.stateSubject;

  constructor(
    private getUser: GetUser,
    private updateUser: UpdateUser,
    private logout: Logout
  ) {}

  getState(): ProfileViewModelState {
    return this.stateSubject.getValue();
  }

  async loadUser(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const user = await this.getUser.execute();
      this.updateState({
        user,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        error: 'Error al cargar perfil',
        isLoading: false,
      });
    }
  }

  async performLogout(): Promise<void> {
    try {
      await this.logout.execute();
      this.updateState({ user: null });
    } catch (error) {
      this.updateState({
        error: 'Error al cerrar sesión',
      });
    }
  }

  private updateState(partialState: Partial<ProfileViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
