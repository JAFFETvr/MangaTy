/**
 * Manga Local DataSource - Mock data for the manga feature
 * All fields match the domain entities. No hardcoded data in the UI.
 */

import { delay } from '@/src/shared/utils';
import { Manga } from '../../domain/entities';

export class MangaLocalDataSource {
  private mangas: Manga[] = [
    {
      id: 1,
      title: 'Sakura Chronicles',
      author: 'Yuki Tanaka',
      rating: 4.7,
      views: '215K',
      tags: ['Romance', 'Drama'],
      chapters: 6,
      cover: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=600&fit=crop',
      creatorId: 'creator-1',
      description:
        'Una historia emotiva sobre una joven que descubre un antiguo diario que revela secretos del pasado de su familia y un amor que trasciende el tiempo.',
      chaptersData: [
        { id: 'c1-1', number: 1, title: 'Cap. 1: El diario encontrado', views: '98K', publishedAt: '14/3/2025', type: 'free_with_ad', price: 0 },
        { id: 'c1-2', number: 2, title: 'Cap. 2: Palabras del pasado', views: '87K', publishedAt: '21/3/2025', type: 'free_with_ad', price: 0 },
        { id: 'c1-3', number: 3, title: 'Cap. 3: La primera carta', views: '75K', publishedAt: '28/3/2025', type: 'premium', price: 10 },
        { id: 'c1-4', number: 4, title: 'Cap. 4: Verdades ocultas', views: '45K', publishedAt: '4/4/2025', type: 'premium', price: 10 },
        { id: 'c1-5', number: 5, title: 'Cap. 5: El secreto familiar', views: '38K', publishedAt: '11/4/2025', type: 'premium', price: 10 },
        { id: 'c1-6', number: 6, title: 'Cap. 6: Un amor eterno', views: '22K', publishedAt: '18/4/2025', type: 'premium', price: 10 },
      ],
    },
    {
      id: 2,
      title: 'Demon Slayer Legacy',
      author: 'Kenta Mori',
      rating: 4.9,
      views: '340K',
      tags: ['Acción', 'Fantasía'],
      chapters: 4,
      cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
      creatorId: 'creator-2',
      description:
        'Una saga épica de cazadores de demonios que protegen a la humanidad en un Japón de la era Taisho lleno de criaturas oscuras.',
      chaptersData: [
        { id: 'c2-1', number: 1, title: 'Cap. 1: El despertar del cazador', views: '120K', publishedAt: '1/2/2025', type: 'free_with_ad', price: 0 },
        { id: 'c2-2', number: 2, title: 'Cap. 2: La primera misión', views: '98K', publishedAt: '8/2/2025', type: 'free_with_ad', price: 0 },
        { id: 'c2-3', number: 3, title: 'Cap. 3: El demonio del bosque', views: '76K', publishedAt: '15/2/2025', type: 'premium', price: 25 },
        { id: 'c2-4', number: 4, title: 'Cap. 4: La espada del sol', views: '46K', publishedAt: '22/2/2025', type: 'premium', price: 25 },
      ],
    },
    {
      id: 3,
      title: 'Tokyo Shadows',
      author: 'Rin Yoshida',
      rating: 4.5,
      views: '178K',
      tags: ['Misterio', 'Thriller'],
      chapters: 2,
      cover: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=600&fit=crop',
      creatorId: 'creator-3',
      description:
        'Un detective en Tokio investiga crímenes imposibles que parecen estar conectados con el mundo de las sombras.',
      chaptersData: [
        { id: 'c3-1', number: 1, title: 'Cap. 1: La escena del crimen', views: '65K', publishedAt: '5/3/2025', type: 'free_with_ad', price: 0 },
        { id: 'c3-2', number: 2, title: 'Cap. 2: Pistas en la oscuridad', views: '48K', publishedAt: '12/3/2025', type: 'premium', price: 15 },
      ],
    },
    {
      id: 4,
      title: 'Dragon Emperor',
      author: 'Sora Hayashi',
      rating: 4.8,
      views: '290K',
      tags: ['Aventura', 'Fantasía'],
      chapters: 2,
      cover: 'https://images.unsplash.com/photo-1614728263952-84ea256f9d4e?w=400&h=600&fit=crop',
      creatorId: 'creator-4',
      description:
        'Un joven descubre que es el último heredero del trono del dragón y debe reunir los artefactos antiguos para salvar su reino.',
      chaptersData: [
        { id: 'c4-1', number: 1, title: 'Cap. 1: El heredero perdido', views: '110K', publishedAt: '10/1/2025', type: 'free_with_ad', price: 0 },
        { id: 'c4-2', number: 2, title: 'Cap. 2: El trono de fuego', views: '80K', publishedAt: '17/1/2025', type: 'premium', price: 20 },
      ],
    },
  ];

  async getAllMangas(): Promise<Manga[]> {
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
        m.author.toLowerCase().includes(lowerQuery)
    );
  }
}
