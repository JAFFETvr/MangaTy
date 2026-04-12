/**
 * History Remote DataSource
 * Handles reading history operations
 */

import { httpClient } from '@/src/core/http/http-client';

interface ReadingHistoryResponse {
  id: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  mangaId: string;
  mangaTitle: string;
  mangaCoverImagePath: string;
  lastPageNumber: number;
  readAt: string;
}

export class HistoryRemoteDataSource {
  /**
   * Get reading history
   */
  async getHistory(): Promise<ReadingHistoryResponse[]> {
    try {
      const response = await httpClient.get<ReadingHistoryResponse[]>('/library/history');
      return response;
    } catch (error) {
      console.error('❌ Error fetching history:', error);
      throw error;
    }
  }

  /**
   * Save or update reading progress for a chapter
   */
  async saveProgress(chapterId: string, lastPageNumber: number): Promise<void> {
    try {
      await httpClient.post('/library/history', {
        chapterId,
        lastPageNumber,
      });
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      throw error;
    }
  }

  /**
   * Add chapter to history
   */
  async addToHistory(chapterId: string, lastPageNumber: number): Promise<void> {
    return this.saveProgress(chapterId, lastPageNumber);
  }

  /**
   * Update chapter progress (same as save)
   */
  async updateProgress(chapterId: string, lastPageNumber: number): Promise<void> {
    return this.saveProgress(chapterId, lastPageNumber);
  }

  /**
   * Clear history (if backend supports it - check API docs)
   */
  async clearHistory(): Promise<void> {
    try {
      // Note: Backend might not have a clear endpoint
      // This is a placeholder for future implementation
      console.warn('⚠️ Clear history not implemented on backend yet');
    } catch (error) {
      console.error('❌ Error clearing history:', error);
      throw error;
    }
  }
}
