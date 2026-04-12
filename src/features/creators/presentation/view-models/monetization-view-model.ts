import { StateFlow } from '@/src/shared/hooks';

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: 'Completado' | 'Procesando';
}

export interface MonetizationState {
  isLoading: boolean;
  isConnectedWithStripe: boolean;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  monthlyGrowth: string;
  transactions: Transaction[];
}

const initialState: MonetizationState = {
  isLoading: false,
  isConnectedWithStripe: false,
  totalBalance: 0.00,
  availableBalance: 0.00,
  pendingBalance: 0.00,
  monthlyGrowth: '+0%',
  transactions: [],
};

export class MonetizationViewModel {
  private stateSubject = new StateFlow<MonetizationState>(initialState);
  state$ = this.stateSubject;

  getState() {
    return this.stateSubject.getValue();
  }

  async connectStripe() {
    this.updateState({ isLoading: true });
    // Mock de conexión con Stripe
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.updateState({ isConnectedWithStripe: true, isLoading: false });
  }

  private updateState(partial: Partial<MonetizationState>) {
    this.stateSubject.setValue({ ...this.getState(), ...partial });
  }
}
