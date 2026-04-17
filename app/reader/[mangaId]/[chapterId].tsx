import ChapterReaderScreen from '@/src/features/manga/presentation/screens/chapter-reader-screen';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function ReaderRoute() {
  const params = useLocalSearchParams<{
    mangaId?: string | string[];
    chapterId?: string | string[];
    isPremium?: string | string[];
  }>();
  const mangaId = Array.isArray(params.mangaId) ? params.mangaId[0] : (params.mangaId || '');
  const chapterId = Array.isArray(params.chapterId) ? params.chapterId[0] : (params.chapterId || '');
  const isPremiumRaw = Array.isArray(params.isPremium) ? params.isPremium[0] : params.isPremium;
  const isPremium = isPremiumRaw === '1';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChapterReaderScreen mangaId={mangaId} chapterId={chapterId} isPremium={isPremium} />
    </>
  );
}
