/**
 * Chapter Entity - alineada con GET /api/comics/{mangaId}/chapters
 * Solo capítulos con status PUBLISHED
 */

export interface Chapter {
  id: string;             // UUID del capítulo
  chapterNumber: number;
  title: string;
  premium: boolean;       // false = gratis con anuncios; true = de pago
  priceTyCoins: number;  // Solo relevante si premium === true
  publishedAt: string;   // ISO 8601
}
