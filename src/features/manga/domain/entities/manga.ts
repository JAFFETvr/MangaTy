/**
 * Manga Entity - Core business model for manga
 */

import { TagCategory } from '@/src/core/theme';
import { Chapter } from './chapter';

export interface Manga {
  id: number;
  title: string;
  tags: TagCategory[];
  chapters: number;
  cover: string;
  authors: string[];
  description: string;
  chaptersData: Chapter[];
}
