/**
 * Navigation types for type-safe app navigation
 */

export type RootStackParamList = {
  '(tabs)': undefined;
  'manga-detail': { mangaId: number };
  'history': undefined;
  'coin-store': undefined;
};

export type TabsParamList = {
  'index': undefined;
  'favorites': undefined;
  'profile': undefined;
};
