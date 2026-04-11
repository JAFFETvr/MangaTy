/**
 * API Configuration - Single source of truth for all API calls
 */

export const API_BASE = 'https://api.angeldev.fun/api';
export const UPLOADS_BASE = 'https://api.angeldev.fun/api/uploads/';

/** Construye la URL completa de la portada a partir de coverImagePath */
export const buildCoverUrl = (coverImagePath: string): string =>
  `${UPLOADS_BASE}${coverImagePath}`;
