export * from './CreatorEarnings';
export * from './CreatorWallet';

// Alias for component compatibility
export type ChapterEarning = import('./CreatorEarnings').CreatorEarnings & {
  coinsSpent?: number;
  createdAt?: Date;
};
