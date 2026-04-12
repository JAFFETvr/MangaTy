import { useLocalSearchParams, Stack } from 'expo-router';
import WebcomicDetailScreen from '@/src/features/manga/presentation/screens/webcomic-detail-screen';

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
  const { slug, mangaId } = useLocalSearchParams<{ slug: string; mangaId: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WebcomicDetailScreen slug={slug} mangaId={mangaId} />
    </>
  );
}
