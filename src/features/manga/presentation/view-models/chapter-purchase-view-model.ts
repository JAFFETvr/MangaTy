import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { Chapter } from '@/src/features/manga/domain/entities/chapter';
import { StateFlow } from '@/src/shared/hooks';

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
  userCoins: 0,
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

  async loadUserCoins() {
    try {
      const token = await TokenStorageService.getToken();
      if (token) {
        httpClient.setToken(token);
      }
      const response = await httpClient.get<any>('/wallet/balance');
      const coins = Number(response?.tyCoins ?? response?.coins ?? response?.balance ?? 0);
      this.updateState({ userCoins: Number.isFinite(coins) ? coins : 0 });
    } catch (error) {
      this.updateState({
        error: 'No se pudo cargar el saldo de monedas',
      });
    }
  }

  setChapter(chapter: Chapter) {
    this.updateState({ 
      chapter, 
      success: false, 
      error: null, 
      insufficientCoins: false 
    });
    void this.loadUserCoins();
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
