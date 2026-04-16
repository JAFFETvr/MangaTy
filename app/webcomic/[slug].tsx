import WebcomicDetailScreen from '@/src/features/manga/presentation/screens/webcomic-detail-screen';
import { Stack, useLocalSearchParams } from 'expo-router';

/**
 * Ruta dinámica /webcomic/[slug]
 *
 * Parámetros de navegación esperados:
 *   - slug    → para GET /api/comics/{slug}
 *   - mangaId → para GET /api/comics/{id}/chapters
 *
 * Ejemplo de navegación:
 *   router.push({ pathname: '/webcomic/[slug]', params: { slug: item.slug, mangaId: item.id } })
 */
export default function WebcomicRoute() {
  const params = useLocalSearchParams<{ slug?: string | string[]; mangaId?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const mangaIdParam = Array.isArray(params.mangaId) ? params.mangaId[0] : params.mangaId;
  const mangaId = mangaIdParam || slug || '';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WebcomicDetailScreen slug={slug || ''} mangaId={mangaId} />
    </>
  );
}
