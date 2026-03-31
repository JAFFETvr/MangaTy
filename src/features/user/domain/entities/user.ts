/**
 * User Entity
 */

export interface User {
  id: string;
  name: string;
  email: string;
  memberSince: Date;
  stats: {
    mangasRead: number;
    favorites: number;
    chaptersRead: number;
  };
}
