/**
 * User Entity
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  coinBalance: number;  // Saldo de monedas del usuario
  memberSince: Date;
  stats: {
    mangasRead: number;
    favorites: number;
    chaptersRead: number;
  };
}
