/**
 * Manga Local DataSource - Mock data for the manga feature
 */

import { delay } from '@/src/shared/utils';
import { Manga } from '../../domain/entities';

export class MangaLocalDataSource {
  private mangas: Manga[] = [
    {
      id: 1,
      title: 'Sakura Chronicles',
      tags: ['Romance', 'Drama'],
      chapters: 156,
      cover: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=200&h=260&fit=crop',
      authors: ['Yuki Tanaka', 'Hiro Matsumoto'],
      description:
        'Una historia emotiva sobre una joven que descubre un antiguo diario que revela secretos del pasado de su familia y un amor que trasciende el tiempo.',
      chaptersData: [
        { number: 1, label: 'Gratis con anuncio', price: 0 },
        { number: 2, label: 'Gratis con anuncio', price: 0 },
        { number: 3, label: '10 monedas', price: 10 },
        { number: 4, label: '10 monedas', price: 10 },
        { number: 5, label: '10 monedas', price: 10 },
        { number: 6, label: '10 monedas', price: 10 },
      ],
    },
    {
      id: 2,
      title: 'Demon Slayer Legacy',
      tags: ['Acción', 'Fantasía'],
      chapters: 203,
      cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=260&fit=crop',
      authors: ['Kenta Mori'],
      description:
        'Una saga épica de cazadores de demonios que protegen a la humanidad en un Japón de la era Taisho lleno de criaturas oscuras.',
      chaptersData: [
        { number: 1, label: 'Gratis con anuncio', price: 0 },
        { number: 2, label: 'Gratis con anuncio', price: 0 },
        { number: 3, label: '10 monedas', price: 10 },
        { number: 4, label: '10 monedas', price: 10 },
      ],
    },
    {
      id: 3,
      title: 'Tokyo Shadows',
      tags: ['Misterio', 'Thriller'],
      chapters: 124,
      cover: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&h=260&fit=crop',
      authors: ['Rin Yoshida'],
      description:
        'Un detective en Tokio investiga crímenes imposibles que parecen estar conectados con el mundo de las sombras.',
      chaptersData: [
        { number: 1, label: 'Gratis con anuncio', price: 0 },
        { number: 2, label: '10 monedas', price: 10 },
      ],
    },
    {
      id: 4,
      title: 'Dragon Emperor',
      tags: ['Aventura', 'Fantasía'],
      chapters: 189,
      cover: 'https://images.unsplash.com/photo-1614728263952-84ea256f9d4e?w=200&h=260&fit=crop',
      authors: ['Sora Hayashi'],
      description:
        'Un joven descubre que es el último heredero del trono del dragón y debe reunir los artefactos antiguos para salvar su reino.',
      chaptersData: [
        { number: 1, label: 'Gratis con anuncio', price: 0 },
        { number: 2, label: '10 monedas', price: 10 },
      ],
    },
  ];

  async getAllMangas(): Promise<Manga[]> {
    // Simular latencia de API
    await delay(300);
    return this.mangas;
  }

  async getMangaById(id: number): Promise<Manga | null> {
    await delay(200);
    return this.mangas.find((m) => m.id === id) || null;
  }

  async searchMangas(query: string): Promise<Manga[]> {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    return this.mangas.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.authors.some((a) => a.toLowerCase().includes(lowerQuery))
    );
  }
}
