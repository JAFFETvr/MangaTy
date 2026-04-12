/**
 * User Entity
 */

export interface User {
  id: string;
  name: string;
  email: string;
  coinBalance: number;  // Saldo de monedas del usuario
  memberSince: Date;
  stats: {
    mangasRead: number;
    favorites: number;
    chaptersRead: number;
  };
}
