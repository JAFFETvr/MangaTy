/**
 * CreatorLocalDataSource - Mock local data for creators
 * En producción, esto se reemplazaría con API calls
 */

import { Creator } from '../../domain/entities';

export class CreatorLocalDataSource {
  private creators: Creator[] = [
    {
      id: 'creator-1',
      name: 'Yuki Tanaka',
      email: 'yuki.tanaka@mangaty.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      bio: 'Creadora de historias románticas con más de 5 años de experiencia. Amante del drama y los finales felices.',
      stripeAccountId: null,
      totalEarnings: 0,
      pendingBalance: 0,
      stats: {
        followers: 1250,
        mangasPublished: 1,
        totalChaptersSold: 0,
        totalRevenue: 0,
      },
      joinedAt: new Date('2024-01-15'),
      lastPayoutAt: null,
    },
    {
      id: 'creator-2',
      name: 'Kenta Mori',
      email: 'kenta.mori@mangaty.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      bio: 'Especialista en acción y fantasía. Fan de las batallas épicas y el desarrollo de personajes complejos.',
      stripeAccountId: null,
      totalEarnings: 0,
      pendingBalance: 0,
      stats: {
        followers: 2340,
        mangasPublished: 1,
        totalChaptersSold: 0,
        totalRevenue: 0,
      },
      joinedAt: new Date('2023-11-20'),
      lastPayoutAt: null,
    },
    {
      id: 'creator-3',
      name: 'Rin Yoshida',
      email: 'rin.yoshida@mangaty.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bio: 'Maestra del suspenso y el misterio. Mis historias te mantendrán despierto por las noches.',
      stripeAccountId: null,
      totalEarnings: 0,
      pendingBalance: 0,
      stats: {
        followers: 890,
        mangasPublished: 1,
        totalChaptersSold: 0,
        totalRevenue: 0,
      },
      joinedAt: new Date('2024-03-10'),
      lastPayoutAt: null,
    },
    {
      id: 'creator-4',
      name: 'Sora Hayashi',
      email: 'sora.hayashi@mangaty.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      bio: 'Aventuras épicas y mundos fantásticos son mi especialidad. Cada capítulo es una nueva sorpresa.',
      stripeAccountId: null,
      totalEarnings: 0,
      pendingBalance: 0,
      stats: {
        followers: 1560,
        mangasPublished: 1,
        totalChaptersSold: 0,
        totalRevenue: 0,
      },
      joinedAt: new Date('2023-12-05'),
      lastPayoutAt: null,
    },
    {
      id: 'creator-5',
      name: 'Hiro Matsumoto',
      email: 'hiro.matsumoto@mangaty.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      bio: 'Co-creador y artista. Especializado en diseño de personajes y narrativa visual.',
      stripeAccountId: null,
      totalEarnings: 0,
      pendingBalance: 0,
      stats: {
        followers: 780,
        mangasPublished: 1,
        totalChaptersSold: 0,
        totalRevenue: 0,
      },
      joinedAt: new Date('2024-01-15'),
      lastPayoutAt: null,
    },
  ];

  // Mapeo de mangaId -> creatorId
  private mangaCreatorMap: Record<number, string> = {
    1: 'creator-1', // Sakura Chronicles
    2: 'creator-2', // Demon Slayer Legacy
    3: 'creator-3', // Tokyo Shadows
    4: 'creator-4', // Dragon Emperor
  };

  /**
   * Simula latencia de red
   */
  private delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get all creators
   */
  async getAllCreators(): Promise<Creator[]> {
    await this.delay(250);
    return [...this.creators];
  }

  /**
   * Get creator by ID
   */
  async getCreatorById(id: string): Promise<Creator | null> {
    await this.delay(200);
    return this.creators.find((c) => c.id === id) || null;
  }

  /**
   * Get manga IDs for a creator
   */
  async getCreatorMangaIds(creatorId: string): Promise<number[]> {
    await this.delay(150);
    return Object.entries(this.mangaCreatorMap)
      .filter(([_, cId]) => cId === creatorId)
      .map(([mangaId]) => parseInt(mangaId));
  }

  /**
   * Get creator ID by manga ID
   */
  async getCreatorIdByMangaId(mangaId: number): Promise<string | null> {
    await this.delay(100);
    return this.mangaCreatorMap[mangaId] || null;
  }

  /**
   * Update creator profile
   */
  async updateCreator(creatorId: string, data: Partial<Creator>): Promise<Creator> {
    await this.delay(300);
    const index = this.creators.findIndex((c) => c.id === creatorId);
    if (index === -1) {
      throw new Error(`Creator ${creatorId} not found`);
    }

    this.creators[index] = { ...this.creators[index], ...data };
    return this.creators[index];
  }

  /**
   * Add earnings to creator (80% of chapter purchase)
   */
  async addEarnings(creatorId: string, amountMXN: number): Promise<void> {
    await this.delay(200);
    const creator = this.creators.find((c) => c.id === creatorId);
    if (!creator) {
      throw new Error(`Creator ${creatorId} not found`);
    }

    creator.pendingBalance += amountMXN;
    creator.totalEarnings += amountMXN;
    creator.stats.totalRevenue += amountMXN;
    creator.stats.totalChaptersSold += 1;
  }

  /**
   * Get earnings for period (mock - returns pending balance)
   */
  async getCreatorEarnings(
    creatorId: string,
    _startDate?: Date,
    _endDate?: Date
  ): Promise<number> {
    await this.delay(150);
    const creator = this.creators.find((c) => c.id === creatorId);
    return creator?.totalEarnings || 0;
  }
}
