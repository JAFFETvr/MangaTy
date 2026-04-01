/**
 * UnlockChapterViewModel - Manages chapter unlocking state and actions
 */

import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { StateFlow } from '@/src/shared/hooks';
import { CheckChapterUnlocked } from '../../domain/use-cases';
import { UnlockChapterOrchestrator, UnlockChapterResult } from '../../domain/use-cases/UnlockChapterOrchestrator';

export interface UnlockChapterViewModelState {
  unlockedChapters: Record<string, boolean>;
  isUnlocking: boolean;
  error: string | null;
  lastUnlockResult: UnlockChapterResult | null;
}

const initialState: UnlockChapterViewModelState = {
  unlockedChapters: {},
  isUnlocking: false,
  error: null,
  lastUnlockResult: null,
};

export class UnlockChapterViewModel {
  private stateSubject = new StateFlow<UnlockChapterViewModelState>(initialState);
  state$ = this.stateSubject;

  private orchestrator: UnlockChapterOrchestrator;
  private checkChapterUnlocked: CheckChapterUnlocked;

  constructor() {
    this.orchestrator = serviceLocator.get(DIKeys.UNLOCK_CHAPTER_ORCHESTRATOR);
    this.checkChapterUnlocked = serviceLocator.get(DIKeys.CHECK_CHAPTER_UNLOCKED);
  }

  getState(): UnlockChapterViewModelState {
    return this.stateSubject.getValue();
  }

  private updateState(partial: Partial<UnlockChapterViewModelState>): void {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }

  async checkUnlocked(userId: string, mangaId: number, chapterNumber: number): Promise<boolean> {
    const key = `${mangaId}-${chapterNumber}`;
    const state = this.getState();

    if (state.unlockedChapters[key] !== undefined) {
      return state.unlockedChapters[key];
    }

    const isUnlocked = await this.checkChapterUnlocked.execute(userId, mangaId, chapterNumber);

    this.updateState({
      unlockedChapters: { ...state.unlockedChapters, [key]: isUnlocked },
    });

    return isUnlocked;
  }

  async unlockChapter(
    userId: string,
    mangaId: number,
    chapterNumber: number,
    creatorId: string,
    cost: number
  ): Promise<UnlockChapterResult> {
    this.updateState({ isUnlocking: true, error: null });

    try {
      const result = await this.orchestrator.execute(userId, mangaId, chapterNumber, creatorId, cost);

      if (result.success) {
        const key = `${mangaId}-${chapterNumber}`;
        this.updateState({
          isUnlocking: false,
          lastUnlockResult: result,
          unlockedChapters: { ...this.getState().unlockedChapters, [key]: true },
        });
      } else {
        this.updateState({ isUnlocking: false, error: result.message, lastUnlockResult: result });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al desbloquear';
      this.updateState({ isUnlocking: false, error: errorMessage });
      return { success: false, message: errorMessage, newBalance: 0, creatorEarned: 0, platformFee: 0 };
    }
  }

  clearError(): void {
    this.updateState({ error: null });
  }
}
