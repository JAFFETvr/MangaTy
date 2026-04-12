/**
 * CoinPackage Entity
 */

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  price: string;        // Precio en string para display
  priceMXN: number;     // Precio real en MXN
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
  userId?: string;
  mangaId?: number;
  chapterNumber?: number;
  creatorId?: string;
}

/**
 * Conversion rate: 1 moneda = 0.20 MXN
 */
export const COIN_TO_MXN = 0.20;
