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
  totalBalance: 420.00,
  availableBalance: 320.00,
  pendingBalance: 100.00,
  monthlyGrowth: '+22.1%',
  transactions: [
    { id: '1', type: 'Venta de capítulo', amount: 45.00, date: '1 Abr 2026', status: 'Completado' },
    { id: '2', type: 'Venta de capítulo', amount: 120.00, date: '2 Abr 2026', status: 'Completado' },
    { id: '3', type: 'Venta de capítulo', amount: 30.00, date: '3 Abr 2026', status: 'Completado' },
    { id: '4', type: 'Venta de capítulo', amount: 85.00, date: '4 Abr 2026', status: 'Completado' },
    { id: '5', type: 'Venta de capítulo', amount: 60.00, date: '5 Abr 2026', status: 'Procesando' },
  ],
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
