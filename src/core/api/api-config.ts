/**
 * API Configuration - Single source of truth for all API calls
 */

export const API_BASE = 'https://api.angeldev.fun/api';
export const UPLOADS_BASE = 'https://api.angeldev.fun/api/uploads/';

/** Construye la URL completa de la portada a partir de coverImagePath
 * Si es un data URI, blob URL, o file://, devuelve como está
 */
export const buildCoverUrl = (coverImagePath?: string | null): string => {
  if (!coverImagePath) {
    return 'https://via.placeholder.com/300x450?text=No+Cover';
  }
  // Si es un data URI (base64), blob URL, o file://, devolver como está
  if (coverImagePath.startsWith('data:') ||
      coverImagePath.startsWith('blob:') ||
      coverImagePath.startsWith('file://')) {
    return coverImagePath;
  }
  // Si es una URL completa, devolver como está
  if (coverImagePath.startsWith('http')) {
    return coverImagePath;
  }
  // Si es un path relativo, construir la URL
  return `${UPLOADS_BASE}${coverImagePath}`;
};
