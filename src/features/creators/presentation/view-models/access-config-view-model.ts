import { StateFlow } from '@/src/shared/hooks';

export type AccessLevel = 'public' | 'unlisted' | 'private';
export type AgeRating = 'all' | '18plus';

export interface AccessConfigState {
  isLoading: boolean;
  isSaving: boolean;
  accessLevel: AccessLevel;
  ageRating: AgeRating;
  allowSharing: boolean;
  success: boolean;
  error: string | null;
}

const initialState: AccessConfigState = {
  isLoading: false,
  isSaving: false,
  accessLevel: 'public',
  ageRating: 'all',
  allowSharing: true,
  success: false,
  error: null,
};

export class AccessConfigViewModel {
  private stateSubject = new StateFlow<AccessConfigState>(initialState);
  state$ = this.stateSubject;

  getState() {
    return this.stateSubject.getValue();
  }

  setAccessLevel(level: AccessLevel) {
    this.updateState({ accessLevel: level });
  }

  setAgeRating(rating: AgeRating) {
    this.updateState({ ageRating: rating });
  }

  setAllowSharing(allow: boolean) {
    this.updateState({ allowSharing: allow });
  }

  async saveConfig() {
    this.updateState({ isSaving: true, error: null });
    try {
      // Mock de guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.updateState({ isSaving: false, success: true });
    } catch (error) {
      this.updateState({ isSaving: false, error: 'Error al guardar la configuración' });
    }
  }

  resetStatus() {
    this.updateState({ success: false, error: null });
  }

  private updateState(partial: Partial<AccessConfigState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
