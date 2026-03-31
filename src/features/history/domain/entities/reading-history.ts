/**
 * ReadingHistory Entity
 */

export interface ReadingHistory {
  mangaId: number;
  chapterNumber: number;
  timestamp: Date;
  progress: number; // percentage 0-100
}
