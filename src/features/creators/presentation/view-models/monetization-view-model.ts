import { httpClient } from '@/src/core/http/http-client';
import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { loadPublicWebcomics } from '@/src/core/storage/local-webcomic-storage';
import { StateFlow } from '@/src/shared/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: 'Completado' | 'Procesando';
}

interface CreatorProfileResponse {
  stripeOnboardingDone?: boolean;
}

interface CreatorEarningsResponse {
  balanceMxn?: number;
  totalEarnedMxn?: number;
}

export interface MonetizationState {
  isLoading: boolean;
  mangaTitle: string;
  error: string | null;
  isConnectedWithStripe: boolean;
  stripeEmail: string;
  stripeAccountId: string | null;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  monthlyGrowth: string;
  transactions: Transaction[];
}

const initialState: MonetizationState = {
  isLoading: false,
  mangaTitle: '',
  error: null,
  isConnectedWithStripe: false,
  stripeEmail: '',
  stripeAccountId: null,
  totalBalance: 0.00,
  availableBalance: 0.00,
  pendingBalance: 0.00,
  monthlyGrowth: '+0%',
  transactions: [],
};

interface MonetizationStorage {
  mangaTitle: string;
  isConnectedWithStripe: boolean;
  stripeEmail: string;
  stripeAccountId: string | null;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  monthlyGrowth: string;
  transactions: Transaction[];
}

export class MonetizationViewModel {
  private stateSubject = new StateFlow<MonetizationState>(initialState);
  state$ = this.stateSubject;

  getState() {
    return this.stateSubject.getValue();
  }

  private async getStorageKey(mangaId: string): Promise<string> {
    const userId = (await TokenStorageService.getUserId()) || 'guest';
    return `@mangaty_${userId}_monetization_${mangaId}`;
  }

  private buildDefaultStorage(mangaTitle: string): MonetizationStorage {
    return {
      mangaTitle,
      isConnectedWithStripe: false,
      stripeEmail: '',
      stripeAccountId: null,
      totalBalance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      monthlyGrowth: '+0%',
      transactions: [],
    };
  }

  private async resolveMangaTitle(mangaId: string): Promise<string> {
    try {
      const localComics = await loadPublicWebcomics();
      const local = localComics.find((comic: any) => String(comic?.id) === String(mangaId));
      if (local?.title) {
        return String(local.title);
      }
    } catch {
      // continuar con fallback remoto
    }

    try {
      const response = await httpClient.get<any>('/comics/me?page=0&size=100&sort=createdAt,desc');
      const list = Array.isArray(response)
        ? response
        : (response?.content ?? response?.data ?? response?.comics ?? []);
      const match = Array.isArray(list)
        ? list.find((comic: any) => String(comic?.id) === String(mangaId))
        : null;
      const title = match?.title;
      return typeof title === 'string' && title.trim() ? title.trim() : '';
    } catch {
      return '';
    }
  }

  async loadMonetization(mangaId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const token = await TokenStorageService.getToken();
      if (token) {
        httpClient.setToken(token);
      }
      const storageKey = await this.getStorageKey(mangaId);
      const remoteTitle = await this.resolveMangaTitle(mangaId);
      const storedRaw = await AsyncStorage.getItem(storageKey);

      let payload: MonetizationStorage = this.buildDefaultStorage(remoteTitle);
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw);
        payload = {
          ...payload,
          ...parsed,
          mangaTitle: remoteTitle || parsed?.mangaTitle || '',
          transactions: Array.isArray(parsed?.transactions) ? parsed.transactions : [],
        };
      }

      let profile: CreatorProfileResponse | null = null;
      let earnings: CreatorEarningsResponse | null = null;
      try {
        profile = await httpClient.get<CreatorProfileResponse>('/creator/profile');
      } catch {
        profile = null;
      }
      try {
        earnings = await httpClient.get<CreatorEarningsResponse>('/creator/earnings');
      } catch {
        earnings = null;
      }

      if (profile) {
        payload.isConnectedWithStripe = Boolean(profile.stripeOnboardingDone);
      }
      if (earnings) {
        payload.availableBalance = Number(earnings.balanceMxn ?? payload.availableBalance ?? 0);
        payload.totalBalance = Number(earnings.totalEarnedMxn ?? payload.totalBalance ?? 0);
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
      this.updateState({
        ...payload,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudo cargar la monetización',
      });
    }
  }

  setStripeEmail(email: string): void {
    this.updateState({ stripeEmail: email, error: null });
  }

  async connectStripe(mangaId: string): Promise<string | null> {
    this.updateState({ isLoading: true, error: null });

    try {
      const token = await TokenStorageService.getToken();
      if (token) {
        httpClient.setToken(token);
      }
      const response = await httpClient.post<{ onboardingUrl?: string }>('/creator/onboarding', {});
      const onboardingUrl = response?.onboardingUrl;
      if (!onboardingUrl) {
        throw new Error('El backend no devolvió onboardingUrl');
      }

      const storageKey = await this.getStorageKey(mangaId);
      const next: MonetizationStorage = {
        mangaTitle: this.getState().mangaTitle,
        isConnectedWithStripe: this.getState().isConnectedWithStripe,
        stripeEmail: this.getState().stripeEmail,
        stripeAccountId: this.getState().stripeAccountId,
        totalBalance: this.getState().totalBalance,
        availableBalance: this.getState().availableBalance,
        pendingBalance: this.getState().pendingBalance,
        monthlyGrowth: this.getState().monthlyGrowth,
        transactions: this.getState().transactions,
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      this.updateState({
        ...next,
        isLoading: false,
        error: null,
      });
      return onboardingUrl;
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudo iniciar onboarding de Stripe',
      });
      return null;
    }
  }

  async requestWithdrawal(mangaId: string): Promise<void> {
    const state = this.getState();
    if (!state.isConnectedWithStripe) {
      this.updateState({ error: 'Primero conecta tu cuenta de Stripe' });
      return;
    }
    if (state.availableBalance <= 0) {
      this.updateState({ error: 'No tienes saldo disponible para retirar' });
      return;
    }

    this.updateState({ isLoading: true, error: null });

    try {
      const token = await TokenStorageService.getToken();
      if (token) {
        httpClient.setToken(token);
      }
      const storageKey = await this.getStorageKey(mangaId);
      const withdrawalResponse = await httpClient.post<{ amountMxn?: number }>('/creator/withdraw', {});
      const withdrawalAmount = Number(withdrawalResponse?.amountMxn ?? state.availableBalance);
      const nextTransactions: Transaction[] = [
        {
          id: `withdraw-${Date.now()}`,
          type: 'Retiro a Stripe',
          amount: withdrawalAmount,
          date: new Date().toLocaleDateString('es-ES'),
          status: 'Completado',
        },
        ...state.transactions,
      ];

      const next: MonetizationStorage = {
        mangaTitle: state.mangaTitle,
        isConnectedWithStripe: state.isConnectedWithStripe,
        stripeEmail: state.stripeEmail,
        stripeAccountId: state.stripeAccountId,
        totalBalance: state.totalBalance,
        availableBalance: 0,
        pendingBalance: state.pendingBalance,
        monthlyGrowth: state.monthlyGrowth,
        transactions: nextTransactions,
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      await this.loadMonetization(mangaId);
      this.updateState({ isLoading: false, error: null });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudo solicitar el retiro',
      });
    }
  }

  private updateState(partial: Partial<MonetizationState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
