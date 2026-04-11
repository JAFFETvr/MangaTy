import { StateFlow } from '@/src/shared/hooks';
import { Chapter } from '@/src/features/manga/domain/entities/chapter';

export interface ChapterPurchaseState {
  chapter: Chapter | null;
  userCoins: number;
  isPurchasing: boolean;
  success: boolean;
  error: string | null;
  insufficientCoins: boolean;
}

const initialState: ChapterPurchaseState = {
  chapter: null,
  userCoins: 10, // Mock: usuario empieza con 10 monedas (insuficiente para 25)
  isPurchasing: false,
  success: false,
  error: null,
  insufficientCoins: false,
};

export class ChapterPurchaseViewModel {
  private stateSubject = new StateFlow<ChapterPurchaseState>(initialState);
  state$ = this.stateSubject;

  getState() {
    return this.stateSubject.getValue();
  }

  setChapter(chapter: Chapter) {
    this.updateState({ 
      chapter, 
      success: false, 
      error: null, 
      insufficientCoins: false 
    });
  }

  async purchaseChapter() {
    const { chapter, userCoins } = this.getState();
    if (!chapter) return;

    const price = chapter.priceTyCoins || 25;

    if (userCoins < price) {
      this.updateState({ insufficientCoins: true });
      return;
    }

    this.updateState({ isPurchasing: true, error: null });

    try {
      // Mock de compra
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.updateState({ 
        isPurchasing: false, 
        success: true,
        userCoins: userCoins - price
      });
    } catch (error) {
      this.updateState({ isPurchasing: false, error: 'Error al procesar la compra' });
    }
  }

  reset() {
    this.updateState({ 
      success: false, 
      error: null, 
      insufficientCoins: false,
      isPurchasing: false 
    });
  }

  private updateState(partial: Partial<ChapterPurchaseState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
