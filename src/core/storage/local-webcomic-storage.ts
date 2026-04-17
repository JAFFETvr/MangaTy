import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenStorageService } from '@/src/core/http/token-storage-service';

export const PUBLIC_WEBCOMICS_STORAGE_KEY = '@mangaty_public_webcomics';
export const getUsernameByUserIdStorageKey = (userId: string) => `@mangaty_username_${userId}`;

export interface LocalWebcomicRecord {
  id: string;
  title: string;
  description?: string;
  genres?: string[] | string;
  coverImage?: string | null;
  chapters?: any[];
  creatorId?: string;
  creatorName?: string;
  viewsCount?: number;
  createdAt?: string;
}

const normalizeWebcomicRecord = (record: LocalWebcomicRecord): LocalWebcomicRecord => ({
  ...record,
  coverImage:
    typeof record.coverImage === 'string' && record.coverImage.startsWith('blob:')
      ? ''
      : record.coverImage,
  viewsCount: typeof record.viewsCount === 'number' ? record.viewsCount : 0,
});

export const getUserWebcomicsStorageKey = (userId: string) => `@mangaty_${userId}_webcomics`;
export const getUserMangaViewsStorageKey = (userId: string) => `@mangaty_${userId}_manga_views`;

export const loadPublicWebcomics = async (): Promise<LocalWebcomicRecord[]> => {
  const raw = await AsyncStorage.getItem(PUBLIC_WEBCOMICS_STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  const publicList = Array.isArray(parsed) ? parsed : [];

  const allKeys = await AsyncStorage.getAllKeys();
  const userWebcomicKeys = allKeys.filter(
    (key) =>
      key !== PUBLIC_WEBCOMICS_STORAGE_KEY &&
      key.startsWith('@mangaty_') &&
      key.endsWith('_webcomics'),
  );

  if (userWebcomicKeys.length === 0) {
    return publicList;
  }

  const userWebcomicsEntries = await AsyncStorage.multiGet(userWebcomicKeys);
  const mergedById = new Map<string, LocalWebcomicRecord>();

  for (const rawComic of publicList) {
    const comic = normalizeWebcomicRecord(rawComic);
    if (comic?.id) mergedById.set(comic.id, comic);
  }

  for (const [, value] of userWebcomicsEntries) {
    if (!value) continue;
    const parsedValue = JSON.parse(value);
    if (!Array.isArray(parsedValue)) continue;

    for (const rawComic of parsedValue) {
      const comic = normalizeWebcomicRecord(rawComic);
      if (!comic?.id) continue;
      const previous = mergedById.get(comic.id);
      mergedById.set(comic.id, {
        ...previous,
        ...comic,
      });
    }
  }

  const mergedList = Array.from(mergedById.values());
  const creatorIdsToResolve = Array.from(
    new Set(
      mergedList
        .filter(
          (comic) =>
            (!comic.creatorName || comic.creatorName === 'Creador') &&
            comic.creatorId,
        )
        .map((comic) => String(comic.creatorId)),
    ),
  );

  if (creatorIdsToResolve.length > 0) {
    const creatorNameEntries = await AsyncStorage.multiGet(
      creatorIdsToResolve.map((creatorId) => getUsernameByUserIdStorageKey(creatorId)),
    );
    const creatorNamesById = new Map<string, string>();

    creatorNameEntries.forEach(([key, value]) => {
      if (!value) return;
      const creatorId = key.replace('@mangaty_username_', '');
      creatorNamesById.set(creatorId, value);
    });

    mergedList.forEach((comic) => {
      if ((!comic.creatorName || comic.creatorName === 'Creador') && comic.creatorId) {
        const creatorName = creatorNamesById.get(String(comic.creatorId));
        if (creatorName) {
          comic.creatorName = creatorName;
        }
      }
    });
  }

  if (
    mergedList.length !== publicList.length ||
    mergedList.some((comic, index) => comic.creatorName !== publicList[index]?.creatorName)
  ) {
    await AsyncStorage.setItem(PUBLIC_WEBCOMICS_STORAGE_KEY, JSON.stringify(mergedList));
  }

  return mergedList;
};

export const upsertPublicWebcomic = async (
  userId: string,
  webcomic: LocalWebcomicRecord,
): Promise<void> => {
  const current = await loadPublicWebcomics();
  const index = current.findIndex((item) => item.id === webcomic.id);
  const nextWebcomic: LocalWebcomicRecord = {
    ...normalizeWebcomicRecord(webcomic),
    creatorId: webcomic.creatorId ?? userId,
  };

  if (index >= 0) {
    current[index] = {
      ...current[index],
      ...nextWebcomic,
      creatorId: current[index].creatorId ?? nextWebcomic.creatorId,
      creatorName: nextWebcomic.creatorName || current[index].creatorName,
      createdAt: nextWebcomic.createdAt || current[index].createdAt,
    };
  } else {
    if (!nextWebcomic.createdAt) {
      nextWebcomic.createdAt = new Date().toISOString();
    }
    current.push(nextWebcomic);
  }

  await AsyncStorage.setItem(PUBLIC_WEBCOMICS_STORAGE_KEY, JSON.stringify(current));
};

export const incrementPublicWebcomicViews = async (webcomicId: string): Promise<number | null> => {
  const targetId = String(webcomicId);
  const publicList = await loadPublicWebcomics();
  const index = publicList.findIndex((item) => String(item.id) === targetId);
  if (index < 0) return null;

  const nextViews = (publicList[index].viewsCount ?? 0) + 1;
  publicList[index] = {
    ...publicList[index],
    viewsCount: nextViews,
  };
  await AsyncStorage.setItem(PUBLIC_WEBCOMICS_STORAGE_KEY, JSON.stringify(publicList));

  const allKeys = await AsyncStorage.getAllKeys();
  const userWebcomicKeys = allKeys.filter(
    (key) =>
      key !== PUBLIC_WEBCOMICS_STORAGE_KEY &&
      key.startsWith('@mangaty_') &&
      key.endsWith('_webcomics'),
  );

  if (userWebcomicKeys.length > 0) {
    const entries = await AsyncStorage.multiGet(userWebcomicKeys);
    const updates: [string, string][] = [];

    for (const [key, value] of entries) {
      if (!value) continue;
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) continue;

      let changed = false;
      const next = parsed.map((item: any) => {
        if (String(item?.id) !== targetId) return item;
        changed = true;
        return {
          ...item,
          viewsCount: nextViews,
        };
      });

      if (changed) {
        updates.push([key, JSON.stringify(next)]);
      }
    }

    if (updates.length > 0) {
      await AsyncStorage.multiSet(updates);
    }
  }

  return nextViews;
};

export const registerUniqueMangaView = async (mangaId: string): Promise<boolean> => {
  const userId = (await TokenStorageService.getUserId()) || 'guest';
  const storageKey = getUserMangaViewsStorageKey(userId);
  const raw = await AsyncStorage.getItem(storageKey);
  const current = raw ? JSON.parse(raw) : [];
  const viewedIds = Array.isArray(current) ? current.map((id) => String(id)) : [];
  const targetId = String(mangaId);

  if (viewedIds.includes(targetId)) {
    return false;
  }

  viewedIds.push(targetId);
  await AsyncStorage.setItem(storageKey, JSON.stringify(Array.from(new Set(viewedIds))));
  return true;
};

export const countUniqueReadersForManga = async (mangaId: string): Promise<number> => {
  const targetId = String(mangaId);
  const allKeys = await AsyncStorage.getAllKeys();
  const viewsKeys = allKeys.filter(
    (key) => key.startsWith('@mangaty_') && key.endsWith('_manga_views'),
  );

  if (viewsKeys.length === 0) {
    return 0;
  }

  const entries = await AsyncStorage.multiGet(viewsKeys);
  let uniqueReaders = 0;

  for (const [, value] of entries) {
    if (!value) continue;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) continue;
      const viewedIds = parsed.map((id) => String(id));
      if (viewedIds.includes(targetId)) {
        uniqueReaders += 1;
      }
    } catch {
      continue;
    }
  }

  return uniqueReaders;
};
