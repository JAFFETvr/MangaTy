/**
 * CreatorViewModel - Manages creator data and earnings display
 */

import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { StateFlow } from '@/src/shared/hooks';
import { Creator } from '../../domain/entities';
import { GetAllCreators, GetCreatorById } from '../../domain/use-cases';

export interface CreatorViewModelState {
  creator: Creator | null;
  creators: Creator[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CreatorViewModelState = {
  creator: null,
  creators: [],
  isLoading: false,
  error: null,
};

export class CreatorViewModel {
  private stateSubject = new StateFlow<CreatorViewModelState>(initialState);
  state$ = this.stateSubject;

  private getCreatorById: GetCreatorById;
  private getAllCreators: GetAllCreators;
  private getCreatorMangas: any; // O el tipo correspondiente si está disponible
  private getCreatorEarnings: any;

  constructor(
    getCreatorById: GetCreatorById,
    getCreatorMangas: any,
    getCreatorEarnings: any,
    getAllCreators: GetAllCreators
  ) {
    this.getCreatorById = getCreatorById;
    this.getCreatorMangas = getCreatorMangas;
    this.getCreatorEarnings = getCreatorEarnings;
    this.getAllCreators = getAllCreators;
  }

  getState(): CreatorViewModelState {
    return this.stateSubject.getValue();
  }

  private updateState(partial: Partial<CreatorViewModelState>): void {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }

  async loadCreator(creatorId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const creator = await this.getCreatorById.execute(creatorId);
      this.updateState({ creator, isLoading: false });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar creador',
      });
    }
  }

  async loadAllCreators(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const creators = await this.getAllCreators.execute();
      this.updateState({ creators, isLoading: false });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar creadores',
      });
    }
  }
}
