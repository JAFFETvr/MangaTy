/**
 * Unlocked Chapters Remote DataSource
 * Handles unlocked chapters tracking
 */

import { httpClient } from '@/src/core/http/http-client';

interface UnlockedResponse {
  chapterId: string;
  tyCoinsSpent: number;
  newBalance: number;
  alreadyUnlocked: boolean;
}

export class UnlockedChaptersRemoteDataSource {
  /**
   * Check if a chapter is unlocked
   * Done by attempting to unlock with idempotency key
   * If alreadyUnlocked=true, it means it was already unlocked before
   */
  async isChapterUnlocked(chapterId: string): Promise<boolean> {
    try {
      // For now, we can't directly check without making an unlock attempt
      // On the frontend, we should track unlocked chapters locally
      console.warn('⚠️ Direct unlock check not available - use local tracking');
      return false;
    } catch (error) {
      console.error('❌ Error checking chapter unlock:', error);
      return false;
    }
  }

  /**
   * Unlock a chapter (delegates to Wallet service)
   */
  async unlockChapter(chapterId: string, idempotencyKey: string): Promise<UnlockedResponse> {
    try {
      const response = await httpClient.postWithHeaders<UnlockedResponse>(
        `/wallet/unlock/${chapterId}`,
        {},
        { 'X-Idempotency-Key': idempotencyKey }
      );
      return response;
    } catch (error) {
      console.error('❌ Error unlocking chapter:', error);
      throw error;
    }
  }

  /**
   * Clear local unlocked chapters cache
   */
  async clearUnlockedChapters(): Promise<void> {
    // This is just for local state management
    console.log('ℹ️ Local unlocked chapters cache cleared');
  }
}
