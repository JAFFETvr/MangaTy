/**
 * ICreatorRepository - Repository interface for Creator data access
 */

import { Creator } from '../entities';

export interface ICreatorRepository {
  /**
   * Get creator by ID
   */
  getCreatorById(id: string): Promise<Creator | null>;
  
  /**
   * Get all creators
   */
  getAllCreators(): Promise<Creator[]>;
  
  /**
   * Get manga IDs published by creator
   */
  getCreatorMangaIds(creatorId: string): Promise<number[]>;
  
  /**
   * Update creator profile
   */
  updateCreator(creatorId: string, data: Partial<Creator>): Promise<Creator>;
  
  /**
   * Update creator earnings (called when chapter is purchased)
   */
  addEarnings(creatorId: string, amount: number): Promise<void>;
  
  /**
   * Get creator earnings for period
   */
  getCreatorEarnings(creatorId: string, startDate?: Date, endDate?: Date): Promise<number>;
}
