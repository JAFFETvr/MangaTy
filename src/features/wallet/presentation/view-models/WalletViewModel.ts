/**
 * WalletViewModel - Manages user wallet transactions and balance
 */

import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { StateFlow } from '@/src/shared/hooks';
import { WalletTransaction } from '../../domain/entities';
import { GetTransactionStats, GetWalletBalance, GetWalletTransactions } from '../../domain/use-cases';

export interface WalletStats {
  totalSpent: number;
  totalPurchased: number;
  totalRewarded: number;
}

export interface WalletViewModelState {
  balance: number;
  transactions: WalletTransaction[];
  stats: WalletStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletViewModelState = {
  balance: 0,
  transactions: [],
  stats: null,
  isLoading: false,
  error: null,
};

export class WalletViewModel {
  private stateSubject = new StateFlow<WalletViewModelState>(initialState);
  state$ = this.stateSubject;

  private getWalletTransactions: GetWalletTransactions;
  private getWalletBalance: GetWalletBalance;
  private getTransactionStats: GetTransactionStats;

  constructor() {
    this.getWalletTransactions = serviceLocator.get(DIKeys.GET_WALLET_TRANSACTIONS);
    this.getWalletBalance = serviceLocator.get(DIKeys.GET_WALLET_BALANCE);
    this.getTransactionStats = serviceLocator.get(DIKeys.GET_TRANSACTION_STATS);
  }

  getState(): WalletViewModelState {
    return this.stateSubject.getValue();
  }

  private updateState(partial: Partial<WalletViewModelState>): void {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }

  async loadWalletData(userId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const [balance, transactions, stats] = await Promise.all([
        this.getWalletBalance.execute(userId),
        this.getWalletTransactions.execute(userId),
        this.getTransactionStats.execute(userId),
      ]);

      this.updateState({
        balance,
        transactions,
        stats,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar wallet',
      });
    }
  }

  async refresh(userId: string): Promise<void> {
    await this.loadWalletData(userId);
  }
}
