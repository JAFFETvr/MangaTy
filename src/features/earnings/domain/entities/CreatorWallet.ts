/**
 * CreatorWallet Entity - Wallet balance for creator
 */

export interface CreatorWallet {
  creatorId: string;
  pendingBalance: number;  // Balance acumulado no pagado (en MXN)
  totalEarned: number;  // Total histórico ganado (en MXN)
  lastPayoutAt: Date | null;
  minimumPayout: number;  // Mínimo para retirar (ej: $100 MXN)
}
