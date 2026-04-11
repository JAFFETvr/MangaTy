import { useLocalSearchParams, Stack } from 'expo-router';
import WebcomicDetailScreen from '@/src/features/manga/presentation/screens/webcomic-detail-screen';

/**
 * Ruta dinámica /webcomic/[id]
 * Pasa el id al componente, quien usa MangaDetailViewModel para cargar los datos reales.
 * No hay ningún dato hardcodeado aquí.
 */
export default function WebcomicRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WebcomicDetailScreen webcomicId={id} />
    </>
  );
}
