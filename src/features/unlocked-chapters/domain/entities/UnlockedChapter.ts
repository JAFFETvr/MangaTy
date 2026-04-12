/**
 * UnlockedChapter Entity - Tracks which chapters a user has unlocked
 */

export interface UnlockedChapter {
  id: string;
  userId: string;
  mangaId: number;
  chapterNumber: number;
  unlockedAt: Date;
  paidAmount: number;  // Monedas gastadas
  method: 'coins' | 'ad';  // Método de desbloqueo
}
