/**
 * EarningsViewModel - Manages creator earnings dashboard
 */

import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { StateFlow } from '@/src/shared/hooks';
import { CreatorEarnings, CreatorWallet } from '../../domain/entities';
import { GetCreatorEarnings, GetCreatorEarningStats, GetCreatorWallet } from '../../domain/use-cases';

export interface EarningsSummary {
  totalEarned: number;
  pendingBalance: number;
  totalTransactions: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
}

export interface EarningsViewModelState {
  wallet: CreatorWallet | null;
  earnings: CreatorEarnings[];
  summary: EarningsSummary | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EarningsViewModelState = {
  wallet: null,
  earnings: [],
  summary: null,
  isLoading: false,
  error: null,
};

export class EarningsViewModel {
  private stateSubject = new StateFlow<EarningsViewModelState>(initialState);
  state$ = this.stateSubject;

  private getCreatorWallet: GetCreatorWallet;
  private getCreatorEarnings: GetCreatorEarnings;
  private getCreatorEarningStats: GetCreatorEarningStats;

  constructor() {
    this.getCreatorWallet = serviceLocator.get(DIKeys.GET_CREATOR_WALLET);
    this.getCreatorEarnings = serviceLocator.get(DIKeys.GET_CREATOR_EARNINGS);
    this.getCreatorEarningStats = serviceLocator.get(DIKeys.GET_CREATOR_EARNING_STATS);
  }

  getState(): EarningsViewModelState {
    return this.stateSubject.getValue();
  }

  private updateState(partial: Partial<EarningsViewModelState>): void {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }

  async loadEarningsData(creatorId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const [wallet, earnings, stats] = await Promise.all([
        this.getCreatorWallet.execute(creatorId),
        this.getCreatorEarnings.execute(creatorId),
        this.getCreatorEarningStats.execute(creatorId),
      ]);

      const summary: EarningsSummary = {
        totalEarned: wallet?.totalEarned || 0,
        pendingBalance: wallet?.pendingBalance || 0,
        totalTransactions: earnings.length,
        todayEarnings: stats.todayEarnings,
        weekEarnings: stats.weekEarnings,
        monthEarnings: stats.monthEarnings,
      };

      this.updateState({
        wallet,
        earnings,
        summary,
        isLoading: false,
      });
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar ganancias',
      });
    }
  }

  canRequestPayout(): boolean {
    const { wallet } = this.getState();
    if (!wallet) return false;
    return wallet.pendingBalance >= wallet.minimumPayout;
  }

  getProgressToMinimumPayout(): number {
    const { wallet } = this.getState();
    if (!wallet) return 0;
    return Math.min((wallet.pendingBalance / wallet.minimumPayout) * 100, 100);
  }
}
