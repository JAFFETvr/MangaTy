/**
 * CoinStoreViewModel
 */

import { StateFlow } from '@/src/shared/hooks';
import { CoinPackage } from '../../domain/entities';
import { GetCoinBalance, GetCoinPackages, PurchaseCoins, WatchAd } from '../../domain/use-cases';

export interface CoinStoreViewModelState {
  balance: number;
  packages: CoinPackage[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CoinStoreViewModelState = {
  balance: 0,
  packages: [],
  isLoading: false,
  error: null,
};

export class CoinStoreViewModel {
  private stateSubject = new StateFlow<CoinStoreViewModelState>(initialState);
  state$ = this.stateSubject;

  constructor(
    private getBalance: GetCoinBalance,
    private getPackages: GetCoinPackages,
    private purchaseCoins: PurchaseCoins,
    private watchAd: WatchAd
  ) {}

  getState(): CoinStoreViewModelState {
    return this.stateSubject.getValue();
  }

  async loadData(): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const [balance, packages] = await Promise.all([
        this.getBalance.execute(),
        this.getPackages.execute(),
      ]);

      this.updateState({
        balance,
        packages,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        error: 'Error al cargar tienda',
        isLoading: false,
      });
    }
  }

  async watchAdVideo(): Promise<void> {
    try {
      const success = await this.watchAd.execute();
      if (success) {
        const newBalance = await this.getBalance.execute();
        this.updateState({ balance: newBalance });
      }
    } catch (error) {
      this.updateState({ error: 'Error al ver anuncio' });
    }
  }

  private updateState(partialState: Partial<CoinStoreViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
