import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProfileVisibility = 'public' | 'followers' | 'private';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  
  // State
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');
  const [showHistory, setShowHistory] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  const [adultContent, setAdultContent] = useState(false);
  
  // Modals
  const [showAdultWarning, setShowAdultWarning] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'warning' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    // Load saved preferences
    AsyncStorage.getItem('@mangaty_adult_content').then((val) => {
      if (val === 'true') setAdultContent(true);
    });
    AsyncStorage.getItem('@mangaty_profile_visibility').then((val) => {
       if (val) setVisibility(val as ProfileVisibility);
    });
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('@mangaty_profile_visibility', visibility);
      await AsyncStorage.setItem('@mangaty_adult_content', adultContent ? 'true' : 'false');
      showToast('Configuración de privacidad guardada', 'success');
      setTimeout(() => router.back(), 2000);
    } catch (error) {
      showToast('No se pudo guardar la configuración', 'error');
    }
  };

  const VisibilityOption = ({ id, title, desc, icon }: { id: ProfileVisibility, title: string, desc: string, icon: string }) => {
    const isSelected = visibility === id;
    return (
      <TouchableOpacity 
        style={[styles.visibilityCard, isSelected && styles.visibilityCardSelected]} 
        onPress={() => setVisibility(id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
          <Feather name={icon as any} size={20} color={isSelected ? '#D8708E' : '#666'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionDesc}>{desc}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkCircle}>
             <Feather name="check" size={14} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacidad</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Visibilidad del perfil */}
        <Text style={styles.sectionHeader}>Visibilidad del perfil</Text>
        <View style={styles.group}>
          <VisibilityOption 
            id="public" 
            title="Público" 
            desc="Cualquiera puede ver tu perfil" 
            icon="users" 
          />
          <VisibilityOption 
            id="followers" 
            title="Solo seguidores" 
            desc="Solo tus seguidores pueden ver tu perfil" 
            icon="user-check" 
          />
          <VisibilityOption 
            id="private" 
            title="Privado" 
            desc="Tu perfil está oculto para todos" 
            icon="lock" 
          />
        </View>

        {/* Visibilidad de actividad */}
        <Text style={styles.sectionHeader}>Visibilidad de actividad</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Historial de lectura</Text>
              <Text style={styles.optionDesc}>Mostrar los webcomics que has leído</Text>
            </View>
            <Switch 
              value={showHistory} 
              onValueChange={setShowHistory}
              trackColor={{ false: '#EEE', true: '#E2919E' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Lista de favoritos</Text>
              <Text style={styles.optionDesc}>Mostrar tus webcomics favoritos</Text>
            </View>
            <Switch 
              value={showFavorites} 
              onValueChange={setShowFavorites}
              trackColor={{ false: '#EEE', true: '#E2919E' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Contenido para adultos */}
        <Text style={styles.sectionHeader}>Contenido para adultos</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Permitir contenido +18</Text>
              <Text style={styles.optionDesc}>Ver webcomics clasificados para adultos</Text>
            </View>
            <Switch 
              value={adultContent} 
              onValueChange={(val) => {
                if (val) {
                  setShowAdultWarning(true);
                } else {
                  setAdultContent(false);
                }
              }}
              trackColor={{ false: '#EEE', true: '#E2919E' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Mis datos */}
        <Text style={styles.sectionHeader}>Mis datos</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow}>
             <Feather name="download" size={20} color="#666" style={{ marginRight: 16 }} />
             <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Solicitar mis datos</Text>
                <Text style={styles.optionDesc}>Descarga una copia de tu información</Text>
             </View>
             <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow}>
             <Feather name="file-text" size={20} color="#666" style={{ marginRight: 16 }} />
             <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Política de Privacidad</Text>
                <Text style={styles.optionDesc}>Lee nuestra política completa</Text>
             </View>
             <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
           <Text style={styles.saveBtnText}>Guardar configuración</Text>
        </TouchableOpacity>

        {/* Zona de peligro */}
        <Text style={[styles.sectionHeader, { color: '#E74C3C' }]}>Zona de peligro</Text>
        <TouchableOpacity style={styles.deleteCard} onPress={() => setShowDeleteModal(true)}>
          <View style={styles.deleteIconBox}>
            <Feather name="trash-2" size={20} color="#E74C3C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionTitle, { color: '#E74C3C' }]}>Eliminar cuenta</Text>
            <Text style={styles.optionDesc}>Esta acción es permanente</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Modal Advertencia +18 ─── */}
      <Modal visible={showAdultWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.adultModal}>
            <View style={styles.warningIconWrapper}>
              <Text style={styles.warningIconEmoji}>⚠️</Text>
            </View>
            <Text style={styles.modalTitle}>Advertencia de contenido +18</Text>
            <Text style={styles.modalSubtitle}>Estás a punto de habilitar contenido para adultos</Text>
            
            <View style={styles.bulletBox}>
              <Text style={styles.bulletHeader}>Al continuar, confirmas que:</Text>
              {['Eres mayor de 18 años', 'Comprendes que verás contenido adulto', 'Podrás desactivar esta opción luego'].map((item, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdultWarning(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={() => { setAdultContent(true); setShowAdultWarning(false); }}>
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Modal Eliminar Cuenta ─── */}
      <Modal visible={showDeleteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <View style={styles.deleteWarningIcon}>
              <Feather name="alert-triangle" size={32} color="#E74C3C" />
            </View>
            
            <Text style={styles.deleteTitle}>¿Eliminar tu cuenta?</Text>
            <Text style={styles.deleteSubtitle}>Esta acción no se puede deshacer</Text>

            <View style={styles.impactBox}>
              <Text style={styles.impactTitle}>Al eliminar tu cuenta:</Text>
              {[
                'Perderás acceso a todos tus webcomics favoritos',
                'Se eliminará tu historial de lectura',
                'Las monedas no utilizadas se perderán',
                'El proceso tomará 30 días en completarse'
              ].map((item, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: '#E74C3C' }]} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.importantNote}>
               <Text style={styles.noteText}>
                 <Text style={{ fontWeight: 'bold' }}>Importante: </Text>
                 Puedes cancelar la eliminación dentro de los primeros 30 días contactando a soporte.
               </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, { backgroundColor: '#FF3B30' }]}
                onPress={() => {
                  setShowDeleteModal(false);
                  showToast('Proceso de eliminación iniciado', 'warning');
                }}
              >
                <Text style={styles.confirmBtnText}>Eliminar cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF7F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A1A2E' },
  scrollContent: { padding: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 12, marginTop: 24 },
  group: { gap: 10 },
  visibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  visibilityCardSelected: { borderColor: '#E2919E', backgroundColor: '#FEF8F9' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconBoxSelected: { backgroundColor: '#FDF0F3' },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  optionDesc: { fontSize: 12, color: '#999' },
  checkCircle: {
     width: 22,
     height: 22,
     borderRadius: 11,
     backgroundColor: '#D8708E',
     justifyContent: 'center',
     alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  divider: { height: 1, backgroundColor: '#F5F5F5' },
  saveBtn: {
    backgroundColor: '#D8708E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  deleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F9',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  deleteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  adultModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  warningIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDEEF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIconEmoji: { fontSize: 28 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A2E', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 20 },
  bulletBox: {
    backgroundColor: '#FAF7F8',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  bulletHeader: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D8708E', marginTop: 6, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F5F5F5', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#D8708E', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },

  // Delete Modal specific
  deleteModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  deleteWarningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDEEF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 8 },
  deleteSubtitle: { fontSize: 15, color: '#888', marginBottom: 24 },
  impactBox: {
    backgroundColor: '#FFF9FA',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  impactTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 12 },
  importantNote: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  noteText: { fontSize: 13, color: '#5D4037', lineHeight: 18 },
  // Toasts
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 9999,
  },
  toast_success: { backgroundColor: '#27AE60' },
  toast_warning: { backgroundColor: '#F2994A' },
  toast_error: { backgroundColor: '#EB5757' },
  toastText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
