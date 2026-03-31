/**
 * User Local DataSource
 */

import { User } from '../../domain/entities';

export class UserLocalDataSource {
  private user: User = {
    id: '1',
    name: 'Usuario',
    email: 'usuario@mail.com',
    memberSince: new Date('2023-01-01'),
    stats: {
      mangasRead: 24,
      favorites: 12,
      chaptersRead: 156,
    },
  };

  async getUser(): Promise<User | null> {
    return { ...this.user };
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    this.user = { ...this.user, ...updates };
    return { ...this.user };
  }

  async logout(): Promise<void> {
    // Clear user session
  }
}
