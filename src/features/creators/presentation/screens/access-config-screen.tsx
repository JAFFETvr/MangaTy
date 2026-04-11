import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { AccessConfigViewModel, AccessLevel, AgeRating } from '../view-models/access-config-view-model';

interface Props {
  mangaId: string;
}

export default function AccessConfigScreen({ mangaId }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<AccessConfigViewModel>(() =>
    serviceLocator.get(DIKeys.ACCESS_CONFIG_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (state.success) {
      Alert.alert('Éxito', 'Configuración guardada correctamente', [
        { text: 'OK', onPress: () => {
          viewModel.resetStatus();
          router.back();
        }}
      ]);
    }
    if (state.error) {
      Alert.alert('Error', state.error);
      viewModel.resetStatus();
    }
  }, [state.success, state.error]);

  const accessLevels: { id: AccessLevel; label: string; desc: string; icon: string }[] = [
    { id: 'public', label: 'Público', desc: 'Cualquiera puede ver y descubrir tu webcomic', icon: 'globe' },
    { id: 'unlisted', label: 'No listado', desc: 'Solo personas con el enlace pueden verlo', icon: 'eye-off' },
    { id: 'private', label: 'Privado', desc: 'Solo tú puedes ver este webcomic (borrador)', icon: 'lock' },
  ];

  const ageRatings: { id: AgeRating; label: string; desc: string }[] = [
    { id: 'all', label: 'Todo público', desc: 'Apto para todas las edades' },
    { id: '18plus', label: '18+', desc: 'Solo adultos' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Configurar acceso</Text>
          <Text style={styles.headerSubtitle}>holaa</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Access Level Section */}
        <Text style={styles.sectionLabel}>Nivel de acceso</Text>
        <View style={styles.radioGroup}>
          {accessLevels.map((level) => {
            const isSelected = state.accessLevel === level.id;
            return (
              <TouchableOpacity 
                key={level.id} 
                style={[styles.radioItem, isSelected && styles.radioItemSelected]}
                onPress={() => viewModel.setAccessLevel(level.id)}
              >
                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                  <Feather name={level.icon as any} size={20} color={isSelected ? "#D8708E" : "#999"} />
                </View>
                <View style={styles.radioText}>
                  <View style={styles.labelRow}>
                    <Text style={styles.radioLabel}>{level.label}</Text>
                    {isSelected && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Activo</Text></View>}
                  </View>
                  <Text style={styles.radioDesc}>{level.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Age Rating Section */}
        <Text style={[styles.sectionLabel, { marginTop: 32 }]}>Clasificación por edad</Text>
        <View style={styles.ageGrid}>
          {ageRatings.map((rating) => {
            const isSelected = state.ageRating === rating.id;
            return (
              <TouchableOpacity 
                key={rating.id} 
                style={[styles.ageCard, isSelected && styles.ageCardSelected]}
                onPress={() => viewModel.setAgeRating(rating.id)}
              >
                <Text style={styles.ageLabel}>{rating.label}</Text>
                <Text style={styles.ageDesc}>{rating.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Free Chapters Link */}
        <Text style={[styles.sectionLabel, { marginTop: 32 }]}>Capítulos gratis</Text>
        <Text style={styles.sectionTip}>Selecciona los capítulos que serán gratuitos con anuncios</Text>
        
        <TouchableOpacity 
          style={styles.settingsLink}
          onPress={() => router.push(`/manage-webcomic/${mangaId}/free-chapters`)}
        >
          <View style={styles.iconCircleSmall}>
            <Feather name="book-open" size={18} color="#D8708E" />
          </View>
          <View style={styles.settingsLinkText}>
            <Text style={styles.settingsLinkLabel}>Configurar capítulos gratuitos</Text>
            <Text style={styles.settingsLinkDesc}>Toca para seleccionar capítulos</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.infoBox}>
           <Feather name="info" size={16} color="#27AE60" />
           <Text style={styles.infoBoxText}>
             Los capítulos gratuitos mostrarán anuncios y permitirán a los lectores probar tu webcomic antes de comprar otros capítulos.
           </Text>
        </View>

        {/* Community Configuration */}
        <Text style={[styles.sectionLabel, { marginTop: 32 }]}>Configuración de comunidad</Text>
        
        <View style={styles.switchGroup}>
          <View style={styles.switchItem}>
            <View style={styles.switchText}>
              <View style={styles.labelWithIcon}>
                <Feather name="users" size={18} color="#666" style={{ marginRight: 8 }} />
                <Text style={styles.switchLabel}>Permitir comentarios</Text>
              </View>
              <Text style={styles.switchDesc}>Los lectores pueden comentar</Text>
            </View>
            <Switch 
              value={state.allowComments} 
              onValueChange={(val) => viewModel.setAllowComments(val)}
              trackColor={{ false: '#EEE', true: '#E2919E' }}
              thumbColor={state.allowComments ? '#FFF' : '#FFF'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchItem}>
            <View style={styles.switchText}>
              <View style={styles.labelWithIcon}>
                <Feather name="share-2" size={18} color="#666" style={{ marginRight: 8 }} />
                <Text style={styles.switchLabel}>Permitir compartir</Text>
              </View>
              <Text style={styles.switchDesc}>Mostrar botones de compartir</Text>
            </View>
            <Switch 
              value={state.allowSharing} 
              onValueChange={(val) => viewModel.setAllowSharing(val)}
              trackColor={{ false: '#EEE', true: '#E2919E' }}
              thumbColor={state.allowSharing ? '#FFF' : '#FFF'}
            />
          </View>
        </View>

        {/* Important Warning */}
        <View style={styles.warningBox}>
          <Feather name="info" size={20} color="#D8708E" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Importante</Text>
            <Text style={styles.warningDesc}>
              Las configuraciones de acceso y clasificación ayudan a los lectores a encontrar contenido apropiado. Asegúrate de seleccionar la clasificación correcta.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, state.isSaving && styles.saveButtonDisabled]}
          onPress={() => viewModel.saveConfig()}
          disabled={state.isSaving}
        >
          {state.isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar configuración</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  sectionTip: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  radioGroup: {
    gap: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  radioItemSelected: {
    borderColor: '#E2919E',
    backgroundColor: '#FEF8F9',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircleSelected: {
    backgroundColor: '#FDF0F3',
  },
  radioText: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  activeBadge: {
    backgroundColor: '#FDF0F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F6D6DF',
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#D8708E',
    fontWeight: 'bold',
  },
  radioDesc: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  ageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  ageCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  ageCardSelected: {
    borderColor: '#E2919E',
    backgroundColor: '#FEF8F9',
  },
  ageLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  ageDesc: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  iconCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FDF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsLinkText: {
    flex: 1,
  },
  settingsLinkLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  settingsLinkDesc: {
    fontSize: 12,
    color: '#999',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F6FBF7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1F1E5',
    alignItems: 'center',
    gap: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
  },
  switchGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    padding: 4,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  switchText: {
    flex: 1,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  switchDesc: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF9FA',
    borderRadius: 20,
    marginTop: 24,
    gap: 12,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  warningDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#E2919E',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
