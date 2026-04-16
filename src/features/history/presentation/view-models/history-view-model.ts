/**
 * HistoryViewModel
 */

import { Manga } from '@/src/features/manga/domain/entities';
import { StateFlow } from '@/src/shared/hooks';
import { ReadingHistory } from '../../domain/entities';
import { AddToHistory, ClearHistory, GetHistory } from '../../domain/use-cases';

export interface HistoryViewModelState {
  history: (ReadingHistory & { manga: Manga })[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HistoryViewModelState = {
  history: [],
  isLoading: false,
  error: null,
};

export class HistoryViewModel {
  private stateSubject = new StateFlow<HistoryViewModelState>(initialState);
  state$ = this.stateSubject;

  constructor(
    private getHistory: GetHistory,
    private addToHistory: AddToHistory,
    private clearHistory: ClearHistory
  ) {}

  getState(): HistoryViewModelState {
    return this.stateSubject.getValue();
  }

  async loadHistory(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const history = await this.getHistory.execute();
      this.updateState({
        history,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        error: 'Error al cargar historial',
        isLoading: false,
      });
    }
  }

  async clear(): Promise<void> {
    try {
      await this.clearHistory.execute();
      this.updateState({ history: [] });
    } catch (error) {
      this.updateState({
        error: 'Error al borrar historial',
      });
    }
  }

  async addEntry(mangaId: string, chapterNumber: number = 1, progress: number = 0): Promise<void> {
    try {
      await this.addToHistory.execute(mangaId, chapterNumber, progress);
      await this.loadHistory();
    } catch (error) {
      this.updateState({
        error: 'Error al guardar historial',
      });
    }
  }

  private updateState(partialState: Partial<HistoryViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
