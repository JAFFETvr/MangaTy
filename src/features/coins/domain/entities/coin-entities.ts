/**
 * CoinPackage Entity
 */

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  price: string;
  popular: boolean;
  best: boolean;
}

/**
 * CoinTransaction Entity
 */

export interface CoinTransaction {
  id: string;
  type: 'purchase' | 'spend' | 'ad-reward';
  amount: number;
  timestamp: Date;
  description: string;
}
