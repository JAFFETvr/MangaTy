import { TokenStorageService } from '@/src/core/http/token-storage-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MangaAccessLevel = 'public' | 'unlisted' | 'private';
export type MangaAgeRating = 'all' | '18plus';

export interface MangaAccessConfig {
  mangaTitle: string;
  accessLevel: MangaAccessLevel;
  ageRating: MangaAgeRating;
  allowSharing: boolean;
}

const defaultConfig: MangaAccessConfig = {
  mangaTitle: '',
  accessLevel: 'public',
  ageRating: 'all',
  allowSharing: true,
};

const getPublicAccessConfigStorageKey = (mangaId: string) => `@mangaty_public_access_${mangaId}`;
const getUserAccessConfigStorageKey = (userId: string, mangaId: string) => `@mangaty_${userId}_access_${mangaId}`;

const parseConfig = (raw: string | null): MangaAccessConfig | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      mangaTitle: typeof parsed?.mangaTitle === 'string' ? parsed.mangaTitle : '',
      accessLevel: parsed?.accessLevel === 'private' || parsed?.accessLevel === 'unlisted' ? parsed.accessLevel : 'public',
      ageRating: parsed?.ageRating === '18plus' ? '18plus' : 'all',
      allowSharing: typeof parsed?.allowSharing === 'boolean' ? parsed.allowSharing : true,
    };
  } catch {
    return null;
  }
};

export const loadMangaAccessConfig = async (mangaId: string): Promise<MangaAccessConfig> => {
  const publicKey = getPublicAccessConfigStorageKey(String(mangaId));
  const publicConfig = parseConfig(await AsyncStorage.getItem(publicKey));
  if (publicConfig) {
    return publicConfig;
  }

  const userId = await TokenStorageService.getUserId();
  if (!userId) {
    return defaultConfig;
  }

  const userKey = getUserAccessConfigStorageKey(userId, String(mangaId));
  const userConfig = parseConfig(await AsyncStorage.getItem(userKey));
  if (!userConfig) {
    return defaultConfig;
  }

  await AsyncStorage.setItem(publicKey, JSON.stringify(userConfig));
  return userConfig;
};

export const saveMangaAccessConfig = async (mangaId: string, config: MangaAccessConfig): Promise<void> => {
  const normalized: MangaAccessConfig = {
    ...defaultConfig,
    ...config,
  };
  const publicKey = getPublicAccessConfigStorageKey(String(mangaId));
  await AsyncStorage.setItem(publicKey, JSON.stringify(normalized));

  const userId = await TokenStorageService.getUserId();
  if (!userId) return;

  const userKey = getUserAccessConfigStorageKey(userId, String(mangaId));
  await AsyncStorage.setItem(userKey, JSON.stringify(normalized));
};

export const getMangaRestrictionMessage = (config: MangaAccessConfig, role: string | null): string | null => {
  return getMangaRestrictionMessageWithAdultPreference(config, role, false);
};

export const loadAdultContentPreference = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem('@mangaty_adult_content');
  return value === 'true';
};

export const getMangaRestrictionMessageWithAdultPreference = (
  config: MangaAccessConfig,
  role: string | null,
  allowsAdultContent: boolean,
): string | null => {
  if (role === 'ROLE_CREATOR' || role === 'ROLE_ADMIN') {
    return null;
  }

  if (config.accessLevel === 'private') {
    return 'Este webcomic está en modo privado y no permite lectura pública.';
  }

  if (config.accessLevel === 'unlisted') {
    return 'Este webcomic está restringido como no listado.';
  }

  if (config.ageRating === '18plus' && !allowsAdultContent) {
    return 'Este capítulo está restringido para mayores de 18 años (+18).';
  }

  return null;
};
