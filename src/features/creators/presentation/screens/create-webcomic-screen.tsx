import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const GENRES = [
  'Drama', 'Romance', 'GL', 'BL', 'Acción', 'Comedia',
  'Fantasía', 'Misterio', 'Omegaverse', 'Historical',
  'Horror', 'Informativo', 'Sobrenatural', 'Superhero',
  'Vida Cotidiana'
];

export default function CreateWebcomicScreen() {
  const insets = useSafeAreaInsets();
  const [showMoreCoverSettings, setShowMoreCoverSettings] = useState(false);
  const [showMoreBannerSettings, setShowMoreBannerSettings] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const pickCoverImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const pickBannerImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setBannerImage(result.assets[0].uri);
    }
  };

  const handleGenreSelect = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    } else {
      if (selectedGenres.length < 3) {
        setSelectedGenres(prev => [...prev, genre]);
      }
    }
  };

  const isFormValid = title.trim().length > 0 && description.trim().length > 0 && selectedGenres.length > 0 && coverImage !== null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Webcomic</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Portada del Webcomic */}
          <Text style={styles.sectionTitle}>Portada del Webcomic</Text>
          <TouchableOpacity style={styles.coverUploadBox} activeOpacity={0.8} onPress={pickCoverImage}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverPreview} resizeMode="contain" />
            ) : (
              <>
                <Feather name="upload" size={32} color="#555" style={{ marginBottom: 12 }} />
                <Text style={styles.coverUploadText}>Subir portada</Text>
                <Text style={styles.coverUploadSubtext}>PNG, JPG hasta 10MB</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.viewMoreContainer}>
            <TouchableOpacity 
              style={styles.viewMoreButton} 
              onPress={() => setShowMoreCoverSettings(!showMoreCoverSettings)}
            >
              <Text style={styles.viewMoreText}>
                {showMoreCoverSettings ? 'Ver menos' : 'Ver más'}
              </Text>
              <Feather 
                name={showMoreCoverSettings ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#D8708E" 
              />
            </TouchableOpacity>
          </View>

          {/* Información Expandida de Portada */}
          {showMoreCoverSettings && (
            <View style={styles.expandedInfoContainer}>
              <Text style={styles.expandedSectionTitle}>Portada del webcomic</Text>
              
              <View style={styles.expandedCardsRow}>
                {/* Dimensiones Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>DIMENSIONES RECOMENDADAS</Text>
                  
                  <Text style={styles.infoSubTitle}>Resolución óptima</Text>
                  <Text style={styles.infoValue}>800 x 1200 px</Text>
                  
                  <Text style={styles.infoSubTitle}>Relación de aspecto</Text>
                  <Text style={styles.infoValue}>2:3 (portrait)</Text>
                  
                  <Text style={styles.infoSubTitle}>Mínimo aceptable</Text>
                  <Text style={styles.infoValue}>400 x 600 px</Text>
                </View>

                {/* Archivo Card */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>ARCHIVO</Text>

                  <Text style={styles.infoSubTitle}>Formatos</Text>
                  <View style={styles.badgesRow}>
                    <View style={[styles.fileBadge, { backgroundColor: '#D4EED7' }]}>
                      <Text style={[styles.fileBadgeText, { color: '#27A45C' }]}>.JPG</Text>
                    </View>
                    <View style={[styles.fileBadge, { backgroundColor: '#D4EED7' }]}>
                      <Text style={[styles.fileBadgeText, { color: '#27A45C' }]}>.PNG</Text>
                    </View>
                    <View style={[styles.fileBadge, { backgroundColor: '#FAD4D9' }]}>
                      <Text style={[styles.fileBadgeText, { color: '#D8708E' }]}>.GIF</Text>
                    </View>
                  </View>

                  <Text style={styles.infoSubTitle}>Tamaño máximo</Text>
                  <Text style={styles.infoValue}>10 MB</Text>

                  <Text style={styles.infoSubTitle}>Modo de color</Text>
                  <Text style={styles.infoValueDescriptive}>RGB (no CMYK)</Text>
                </View>
              </View>

              {/* Vista Previa Card */}
              <View style={styles.previewCard}>
                <Text style={styles.infoTitle}>VISTA PREVIA DE PROPORCIONES</Text>
                <View style={styles.previewRow}>
                  <View style={styles.previewItem}>
                    <View style={[styles.previewBox, styles.preview23]} />
                    <Text style={[styles.previewLabel, { color: '#27A45C' }]}>2:3 — ideal</Text>
                  </View>
                  <View style={styles.previewItem}>
                    <View style={[styles.previewBox, styles.preview11]} />
                    <Text style={[styles.previewLabel, { color: '#DAA520' }]}>1:1 — se recorta</Text>
                  </View>
                  <View style={styles.previewItem}>
                    <View style={[styles.previewBox, styles.previewLandscape]} />
                    <Text style={[styles.previewLabel, { color: '#D8708E' }]}>landscape — no usar</Text>
                  </View>
                </View>
              </View>

              {/* Reglas de contenido */}
              <Text style={[styles.expandedSectionTitle, { marginTop: 12 }]}>Reglas de contenido de portada</Text>
              <View style={styles.rulesCard}>
                
                <View style={styles.ruleItem}>
                  <Feather name="check" size={16} color="#27A45C" style={styles.ruleIcon} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>Imagen propia o con derechos libres de uso</Text>
                    <Text style={styles.ruleSubText}>Ilustración original, arte del webcomic, foto con licencia CC0</Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <Feather name="check" size={16} color="#27A45C" style={styles.ruleIcon} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>Fondo sólido o con pocos elementos — el texto del título se superpondrá encima</Text>
                    <Text style={styles.ruleSubText}>La app muestra el título del webcomic como overlay sobre la portada</Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <Feather name="x" size={16} color="#D8708E" style={styles.ruleIcon} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>Sin texto incrustado en la imagen de portada</Text>
                    <Text style={styles.ruleSubText}>El título y la descripción se muestran desde la base de datos, no desde la imagen</Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <Feather name="x" size={16} color="#D8708E" style={styles.ruleIcon} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>Sin logos de otras plataformas, marcas de agua ni firmas de autor visibles</Text>
                  </View>
                </View>
                
              </View>

            </View>
          )}

          {/* Imagen Promocional (Banner) */}
          <Text style={styles.sectionTitle}>Imagen Promocional (Banner)</Text>
          <TouchableOpacity style={styles.coverUploadBox} activeOpacity={0.8} onPress={pickBannerImage}>
            {bannerImage ? (
              <Image source={{ uri: bannerImage }} style={styles.coverPreview} resizeMode="contain" />
            ) : (
              <>
                <Feather name="upload" size={32} color="#555" style={{ marginBottom: 12 }} />
                <Text style={styles.coverUploadText}>Subir imagen horizontal</Text>
                <Text style={styles.coverUploadSubtext}>PNG, JPG hasta 10MB</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.viewMoreContainer}>
            <TouchableOpacity 
              style={styles.viewMoreButton} 
              onPress={() => setShowMoreBannerSettings(!showMoreBannerSettings)}
            >
              <Text style={styles.viewMoreText}>
                {showMoreBannerSettings ? 'Ver menos' : 'Ver más'}
              </Text>
              <Feather 
                name={showMoreBannerSettings ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#D8708E" 
              />
            </TouchableOpacity>
          </View>

          {/* Información Expandida de Banner */}
          {showMoreBannerSettings && (
            <View style={styles.expandedInfoContainer}>
              <View style={styles.bannerInfoBox}>
                <Text style={styles.bannerInfoText}>
                  Esta imagen no será visible para los lectores al navegar la app. Es una imagen de respaldo que usamos si tu webcomic es seleccionado para aparecer en el carrusel de recomendados del inicio. Si no la subes, usaremos tu portada vertical adaptada automáticamente.
                </Text>
              </View>

              <Text style={styles.expandedSectionTitle}>Reglas de diseño para el banner</Text>
              <View style={styles.rulesCard}>
                
                <View style={styles.ruleItem}>
                  <View style={[styles.ruleDot, { backgroundColor: '#27A45C' }]} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>El punto de atención visual debe estar centrado o ligeramente a la izquierda</Text>
                    <Text style={styles.ruleSubText}>El carrusel muestra el título en la esquina inferior izquierda como overlay — la zona derecha puede estar más vacía</Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <View style={[styles.ruleDot, { backgroundColor: '#27A45C' }]} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>Fondo con zona oscura o suficiente contraste en la parte inferior</Text>
                    <Text style={styles.ruleSubText}>El título y la descripción se superponen con texto blanco, necesitan contraste legible</Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <View style={[styles.ruleDot, { backgroundColor: '#27A45C' }]} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>Sin texto incrustado en la imagen</Text>
                    <Text style={styles.ruleSubText}>El título se añade automáticamente desde la base de datos como overlay</Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <View style={[styles.ruleDot, { backgroundColor: '#3B82F6' }]} />
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleMainText}>Si el creador no sube banner, la app genera uno automáticamente</Text>
                    <Text style={styles.ruleSubText}>Crop centrado de la portada vertical con fondo difuminado — no es ideal pero es funcional</Text>
                  </View>
                </View>
                
              </View>
            </View>
          )}

          {/* Título */}
          <Text style={styles.sectionTitle}>Título del Webcomic</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ej: Mi Historia Romántica" 
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          {/* Descripción */}
          <Text style={styles.sectionTitle}>Descripción</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Describe tu historia..." 
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            maxLength={500}
          />

          {/* Géneros */}
          <Text style={styles.sectionTitle}>Géneros ({selectedGenres.length}/3)</Text>
          <View style={styles.genresContainer}>
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <TouchableOpacity
                  key={genre}
                  style={[styles.genreButton, isSelected && styles.genreButtonSelected]}
                  onPress={() => handleGenreSelect(genre)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genreText, isSelected && styles.genreTextSelected]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Button Submit */}
          <TouchableOpacity 
            style={[styles.submitButton, isFormValid ? styles.submitButtonActive : styles.submitButtonDisabled]}
            disabled={!isFormValid}
            activeOpacity={0.8}
            onPress={async () => {
              // Persistir imagen
              let persistedCover = coverImage;
              if (persistedCover && persistedCover.startsWith('file://')) {
                try {
                  const base64 = await FileSystem.readAsStringAsync(persistedCover, {
                    encoding: 'base64',
                  });
                  persistedCover = `data:image/jpeg;base64,${base64}`;
                } catch (e) {
                  console.error('Error persisting cover:', e);
                }
              }

              const newWebcomic = {
                id: Date.now().toString(),
                title,
                description,
                genres: selectedGenres,
                coverImage: persistedCover,
                chapters: [],
              };
              const storedStr = await AsyncStorage.getItem('@mock_created_webcomics');
              const stored = storedStr ? JSON.parse(storedStr) : [];
              stored.push(newWebcomic);
              await AsyncStorage.setItem('@mock_created_webcomics', JSON.stringify(stored));
              
              router.replace('/my-webcomics');
            }}
          >
            <Text style={[styles.submitButtonText, isFormValid ? styles.submitButtonTextActive : styles.submitButtonTextDisabled]}>
              Crear Webcomic
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 16,
  },
  coverUploadBox: {
    height: 220,
    backgroundColor: '#F7EBEE',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  coverUploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  coverUploadSubtext: {
    fontSize: 12,
    color: '#777',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  viewMoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  viewMoreText: {
    color: '#D8708E',
    fontSize: 13,
    fontWeight: '500',
  },
  expandedInfoContainer: {
    marginBottom: 16,
  },
  expandedSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  expandedCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FAF5F7',
    borderRadius: 12,
    padding: 12,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#777',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoSubTitle: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  infoValueDescriptive: {
    fontSize: 12,
    color: '#777',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  fileBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#FAF5F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  previewItem: {
    alignItems: 'center',
  },
  previewBox: {
    borderWidth: 2,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  preview23: {
    width: 30,
    height: 45,
    borderColor: '#73D896',
    backgroundColor: '#D4EED7',
  },
  preview11: {
    width: 40,
    height: 40,
    borderColor: '#F1D572',
    backgroundColor: '#FDECB1',
  },
  previewLandscape: {
    width: 50,
    height: 30,
    borderColor: '#F09CB3',
    backgroundColor: '#FAD4D9',
  },
  previewLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
  rulesCard: {
    backgroundColor: '#FAF5F7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ruleIcon: {
    marginTop: 2,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  bannerInfoBox: {
    backgroundColor: '#FAF5F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerInfoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  ruleTextContainer: {
    flex: 1,
  },
  ruleMainText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  ruleSubText: {
    fontSize: 11,
    color: '#777',
  },
  input: {
    backgroundColor: '#F7EBEE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  genreButton: {
    backgroundColor: '#F7EBEE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: '30%',
    alignItems: 'center',
  },
  genreButtonSelected: {
    backgroundColor: '#D8708E',
  },
  genreText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  genreTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#D8708E',
  },
  submitButtonDisabled: {
    backgroundColor: '#EDC8D5',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: '#FFFFFF',
  },
});
