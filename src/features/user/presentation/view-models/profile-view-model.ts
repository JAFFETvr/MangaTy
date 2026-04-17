/**
 * ProfileViewModel
 */

import { StateFlow } from '@/src/shared/hooks';
import { User } from '../../domain/entities';
import { ChangePassword, GetUser, Logout, UpdateUser, UploadAvatar } from '../../domain/use-cases';

export interface ProfileViewModelState {
  user: User | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: ProfileViewModelState = {
  user: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

export class ProfileViewModel {
  private stateSubject = new StateFlow<ProfileViewModelState>(initialState);
  state$ = this.stateSubject;

  constructor(
    private getUser: GetUser,
    private updateUser: UpdateUser,
    private logout: Logout,
    private changePasswordUseCase: ChangePassword,
    private uploadAvatarUseCase: UploadAvatar
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

  async updateName(newName: string): Promise<boolean> {
    this.updateState({ isSaving: true, error: null });
    try {
      const updatedUser = await this.updateUser.execute({ name: newName });
      this.updateState({
        user: updatedUser,
        isSaving: false,
      });
      return true;
    } catch (error) {
      this.updateState({
        error: 'Error al actualizar el nombre',
        isSaving: false,
      });
      return false;
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

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.updateState({ isSaving: true, error: null });
    try {
      await this.changePasswordUseCase.execute(currentPassword, newPassword);
      this.updateState({ isSaving: false });
    } catch (error) {
      this.updateState({
        isSaving: false,
        error: error instanceof Error ? error.message : 'No se pudo cambiar la contraseña',
      });
      throw error instanceof Error ? error : new Error('No se pudo cambiar la contraseña');
    }
  }

  async updateProfilePhoto(imageUri: string): Promise<string> {
    this.updateState({ isSaving: true, error: null });
    try {
      const avatarUrl = await this.uploadAvatarUseCase.execute(imageUri);
      const current = this.getState().user;
      this.updateState({
        isSaving: false,
        user: current ? { ...current, avatarUrl } : current,
      });
      return avatarUrl;
    } catch (error) {
      this.updateState({
        isSaving: false,
        error: error instanceof Error ? error.message : 'No se pudo subir la foto de perfil',
      });
      throw error instanceof Error ? error : new Error('No se pudo subir la foto de perfil');
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
