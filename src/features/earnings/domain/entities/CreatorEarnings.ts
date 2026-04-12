/**
 * CreatorEarnings Entity - Individual earning record for creator
 */

export interface CreatorEarnings {
  id: string;
  creatorId: string;
  mangaId: number;
  chapterNumber: number;
  userId: string;  // Usuario que pagó
  coinsEarned: number;  // Monedas que recibió el creador (80% del pago)
  amountMXN: number;  // Valor en MXN
  platformFee: number;  // Comisión de plataforma (20% en MXN)
  creatorRevenue: number;  // Ganancia del creador (80% en MXN)
  timestamp: Date;
  status: 'pending' | 'accumulated' | 'paid';
}
