import * as FileSystem from 'expo-file-system';

const blobToDataUri = async (blob: Blob): Promise<string> => {
  if (typeof FileReader === 'undefined') {
    throw new Error('FileReader no disponible para convertir blob');
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo convertir blob a data URI'));
    reader.readAsDataURL(blob);
  });
};

export const persistImageUri = async (uri: string | null): Promise<string | null> => {
  if (!uri) return uri;

  if (uri.startsWith('data:') || uri.startsWith('http')) {
    return uri;
  }

  if (uri.startsWith('file://')) {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    return `data:image/jpeg;base64,${base64}`;
  }

  if (uri.startsWith('blob:')) {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blobToDataUri(blob);
  }

  return uri;
};
