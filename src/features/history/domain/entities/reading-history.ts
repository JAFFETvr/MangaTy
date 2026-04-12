/**
 * ReadingHistory Entity
 */

export interface ReadingHistory {
  mangaId: string;    // UUID del manga
  chapterNumber: number;
  timestamp: Date;
  progress: number; // percentage 0-100
}
