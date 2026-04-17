/**
 * CoinStoreViewModel
 */

import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { StateFlow } from '@/src/shared/hooks';
import { CoinPackage } from '../../domain/entities';
import { CreateCheckout, GetCoinBalance, GetCoinPackages, PurchaseCoins, WatchAd } from '../../domain/use-cases';

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
    private watchAd: WatchAd,
    private createCheckout: CreateCheckout
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

  async checkout(packageId: string): Promise<string | null> {
    try {
      const role = await TokenStorageService.getRole();
      if (role === 'ROLE_CREATOR') {
        this.updateState({
          error: 'Tu cuenta es ROLE_CREATOR. El backend permite checkout solo para ROLE_USER.',
        });
        return null;
      }

      const idempotencyKey = this.generateIdempotencyKey();
      const checkoutUrl = await this.createCheckout.execute(packageId, idempotencyKey);
      return checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fallo al procesar el checkout con Stripe';
      this.updateState({ error: message });
      return null;
    }
  }

  private generateIdempotencyKey(): string {
    const globalCrypto = globalThis.crypto as {
      randomUUID?: () => string;
      getRandomValues?: (array: Uint8Array) => Uint8Array;
    } | undefined;
    if (globalCrypto?.randomUUID) {
      return globalCrypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    if (globalCrypto?.getRandomValues) {
      globalCrypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    // RFC 4122 v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  private updateState(partialState: Partial<CoinStoreViewModelState>): void {
    const currentState = this.getState();
    this.stateSubject.setValue({
      ...currentState,
      ...partialState,
    });
  }
}
