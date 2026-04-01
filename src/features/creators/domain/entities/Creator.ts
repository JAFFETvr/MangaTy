/**
 * Creator Entity - Represents content creators who publish manga
 */

export interface Creator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  
  // Stripe integration (null for local development)
  stripeAccountId?: string | null;
  
  // Financial tracking
  totalEarnings: number;      // Total histórico en MXN
  pendingBalance: number;      // Balance acumulado no pagado en MXN
  
  // Creator stats
  stats: {
    followers: number;
    mangasPublished: number;
    totalChaptersSold: number;
    totalRevenue: number;       // Total en MXN
  };
  
  // Metadata
  joinedAt: Date;
  lastPayoutAt?: Date | null;
}
