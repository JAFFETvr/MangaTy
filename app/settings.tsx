import { TokenStorageService } from '@/src/core/http/token-storage-service';
import { persistImageUri } from '@/src/core/utils/persist-image-uri';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { STORAGE_KEY_EMAIL } from '@/src/features/auth/login/presentation/view-models/login-view-model';
import { STORAGE_KEY_USERNAME } from '@/src/features/auth/register/presentation/view-models/register-view-model';
import { ProfileViewModel } from '@/src/features/user/presentation/view-models/profile-view-model';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const getPhotoStorageKey = (email: string) => `@mangaty_photo_${email}`;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<ProfileViewModel>(() =>
    serviceLocator.get(DIKeys.PROFILE_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Username editing state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [lastUsernameChange, setLastUsernameChange] = useState<number | null>(null);
  
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
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadUser();

    // Cargar última fecha de cambio de nombre
    AsyncStorage.getItem('@mangaty_last_username_change').then((timestamp) => {
      if (timestamp) setLastUsernameChange(parseInt(timestamp));
    });
    return unsubscribe;
  }, [viewModel]);

  const user = state.user;

  // Cargar foto específica del usuario cuando su info esté disponible
  useEffect(() => {
    if (user?.email) {
      AsyncStorage.getItem(getPhotoStorageKey(user.email)).then((saved) => {
        if (saved?.startsWith('blob:')) {
          void AsyncStorage.removeItem(getPhotoStorageKey(user.email));
          setPhotoUri(null);
          return;
        }
        setPhotoUri(saved || null);
      });
    }
  }, [user?.email]);

  const savePhoto = async (uri: string) => {
    try {
      const finalUri = await persistImageUri(uri);
      setPhotoUri(finalUri);
      if (user?.email) {
        // Guardar la URL/data URI para persistencia
        await AsyncStorage.setItem(getPhotoStorageKey(user.email), finalUri || '');
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'No se pudo guardar la foto');
    }
  };

  const executeLogout = async () => {
    try {
      await viewModel.performLogout();
      await TokenStorageService.clearAuth();
      await AsyncStorage.multiRemove([
        'auth_token',
        'auth_user',
        STORAGE_KEY_EMAIL,
        STORAGE_KEY_USERNAME,
      ]);
      if (Platform.OS === 'web') {
        globalThis.location?.replace(`${globalThis.location.origin}/login`);
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('❌ Error en logout:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión correctamente');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = globalThis.confirm?.('¿Estás seguro que deseas cerrar sesión?') ?? true;
      if (confirmed) {
        void executeLogout();
      }
      return;
    }

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            void executeLogout();
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    const notifyError = (message: string) => {
      if (Platform.OS === 'web') {
        showToast(message, 'error');
      } else {
        Alert.alert('Error', message);
      }
    };

    if (!currentPassword.trim()) {
      notifyError('Por favor ingresa tu contraseña actual');
      return;
    }
    if (newPassword.length < 8) {
      notifyError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      notifyError('Las contraseñas no coinciden');
      return;
    }

    try {
      await viewModel.changePassword(currentPassword.trim(), newPassword.trim());

      const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
      };

      if (Platform.OS === 'web') {
        resetForm();
        showToast('Tu contraseña ha sido cambiada correctamente', 'success');
      } else {
        Alert.alert(
          'Éxito',
          'Tu contraseña ha sido cambiada correctamente',
          [{ text: 'OK', onPress: resetForm }]
        );
      }
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña');
    }
  };

  const handleSaveUsername = async () => {
    if (!tempUsername.trim()) {
      showToast('El nombre de usuario no puede estar vacío', 'error');
      return;
    }

    // Verificar restricción de 7 días (604800000 ms)
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (lastUsernameChange && now - lastUsernameChange < ONE_WEEK_MS) {
      const daysLeft = Math.ceil((ONE_WEEK_MS - (now - lastUsernameChange)) / (24 * 60 * 60 * 1000));
      showToast(`Podrás cambiarlo de nuevo en aproximadamente ${daysLeft} día(s)`, 'warning');
      return;
    }

    const success = await viewModel.updateName(tempUsername.trim());
    if (success) {
      const timestamp = Date.now();
      setLastUsernameChange(timestamp);
      await AsyncStorage.setItem('@mangaty_last_username_change', timestamp.toString());
      setIsEditingUsername(false);
      showToast('Nombre de usuario actualizado', 'success');
    }
  };

  const handleEditUsername = () => {
    // Si hay restricción, informar antes de dejar editar
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (lastUsernameChange && now - lastUsernameChange < ONE_WEEK_MS) {
        const daysLeft = Math.ceil((ONE_WEEK_MS - (now - lastUsernameChange)) / (24 * 60 * 60 * 1000));
        showToast(`Editar disponible en ${daysLeft} día(s)`, 'warning');
        return;
    }
    setTempUsername(user?.name || '');
    setIsEditingUsername(true);
  };

  const pickFromGallery = async () => {
    setShowPhotoModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar tu foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      await savePhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setShowPhotoModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      await savePhoto(result.assets[0].uri);
    }
  };

  const memberSinceFormatted = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString('es-MX', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Foto de Perfil */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Foto de perfil</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={() => setShowPhotoModal(true)}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarCircle} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Feather name="user" size={38} color="#D8708E" />
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Feather name="camera" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.photoTextCol}>
              <Text style={styles.photoHint}>
                Puedes cambiar tu foto de perfil cuantas veces quieras
              </Text>
              <TouchableOpacity style={styles.changePhotoBtn} onPress={() => setShowPhotoModal(true)}>
                <Text style={styles.changePhotoBtnText}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Nombre de Usuario */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Nombre de usuario</Text>
            {!isEditingUsername && (
              <TouchableOpacity onPress={handleEditUsername}>
                <Text style={styles.editLink}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingUsername ? (
            <View style={styles.editUsernameContainer}>
              <TextInput
                style={styles.usernameInput}
                value={tempUsername}
                onChangeText={setTempUsername}
                placeholder="Nuevo nombre de usuario"
                autoFocus
                maxLength={20}
              />
              <View style={styles.editButtonsRow}>
                <TouchableOpacity 
                  style={styles.cancelNameBtn} 
                  onPress={() => setIsEditingUsername(false)}
                >
                  <Text style={styles.cancelNameText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveNameBtn, state.isSaving && { opacity: 0.6 }]} 
                  onPress={handleSaveUsername}
                  disabled={state.isSaving}
                >
                  <Text style={styles.saveNameText}>
                    {state.isSaving ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.usernameRow}>
              <Feather name="user" size={16} color="#999" style={{ marginRight: 8 }} />
              <Text style={styles.usernameText}>
                {user?.name && user.name !== 'Usuario' ? user.name : 'Sin nombre'}
              </Text>
            </View>
          )}

          <Text style={styles.hintText}>
            Puedes cambiar tu nombre de usuario. Recuerda que solo podrás hacerlo una vez cada 1 semana.
          </Text>
        </View>

        {/* Información de la Cuenta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de la cuenta</Text>

          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color="#999" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{user?.email || '—'}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Feather name="calendar" size={16} color="#999" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>{memberSinceFormatted}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Feather name="user" size={16} color="#999" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Tipo de cuenta</Text>
              <Text style={styles.infoValue}>Lector activo</Text>
            </View>
          </View>
        </View>

        {/* Otras Opciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Otras opciones</Text>
          {[
            { label: 'Cambiar contraseña', icon: 'lock', action: () => setShowPasswordModal(true) },
            { label: 'Privacidad', icon: 'shield', action: () => router.push('/privacy') },
            { label: 'Notificaciones', icon: 'bell', action: () => router.push('/notifications') },
          ].map((item, idx, arr) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.optionRow} onPress={item.action}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={18} color="#CCC" />
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>


        {/* Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ─── Modal Cambiar Contraseña ─── */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPasswordModal(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Cambiar contraseña</Text>
            <Text style={styles.modalSubtitle}>Actualiza tu contraseña para mantener tu cuenta segura</Text>

            {/* Contraseña actual */}
            <Text style={styles.inputLabel}>Contraseña actual</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingresa tu contraseña actual"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor="#CCC"
            />

            {/* Nueva contraseña */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Nueva contraseña</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#CCC"
            />
            {newPassword && (
              <Text style={[styles.hintText, { marginTop: 6 }]}>
                {newPassword.length < 8 ? `${8 - newPassword.length} caracteres más necesarios` : '✓ Contraseña válida'}
              </Text>
            )}

            {/* Confirmar contraseña */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Confirmar nueva contraseña</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repite tu nueva contraseña"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#CCC"
            />
            {confirmPassword && (
              <Text style={[styles.hintText, { marginTop: 6 }]}>
                {confirmPassword !== newPassword ? '✗ No coinciden' : '✓ Coinciden'}
              </Text>
            )}

            {/* Botones */}
            <View style={styles.passwordButtonRow}>
              <TouchableOpacity style={styles.passwordCancelBtn} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.passwordCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.passwordConfirmBtn, state.isSaving && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={state.isSaving}
              >
                <Text style={styles.passwordConfirmText}>
                  {state.isSaving ? 'Cambiando...' : 'Cambiar contraseña'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>


      {/* ─── Modal Personalizado: Cambiar Foto ─── */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        {/* Overlay oscuro */}
        <Pressable style={styles.modalOverlay} onPress={() => setShowPhotoModal(false)}>
          {/* Sheet con bordes redondeados */}
          <Pressable style={styles.modalSheet} onPress={() => {}}>

            {/* Píldora de drag */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Foto de perfil</Text>
            <Text style={styles.modalSubtitle}>Elige cómo quieres actualizar tu foto</Text>

            {/* Opción: Galería */}
            <TouchableOpacity style={styles.modalOption} onPress={pickFromGallery} activeOpacity={0.7}>
              <View style={[styles.modalOptionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="image" size={22} color="#6C7FD8" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Elegir de galería</Text>
                <Text style={styles.modalOptionDesc}>Selecciona una imagen de tu galería</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.modalSeparator} />

            {/* Opción: Cámara */}
            <TouchableOpacity style={styles.modalOption} onPress={takePhoto} activeOpacity={0.7}>
              <View style={[styles.modalOptionIcon, { backgroundColor: '#FFF0F4' }]}>
                <Feather name="camera" size={22} color="#D8708E" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Tomar foto</Text>
                <Text style={styles.modalOptionDesc}>Usa la cámara de tu dispositivo</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#CCC" />
            </TouchableOpacity>

            {/* Botón Cancelar */}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPhotoModal(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── Tostada Estética (Toast) ─── */}
      {toast.visible && (
        <View style={[styles.toastContainer, styles[`toast_${toast.type}`]]}>
          <Feather 
            name={toast.type === 'success' ? 'check-circle' : toast.type === 'warning' ? 'alert-circle' : 'x-circle'} 
            size={18} 
            color="#FFF" 
            style={{ marginRight: 10 }}
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 16 },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editLink: { fontSize: 14, color: '#D8708E', fontWeight: '600' },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FCF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F6D6DF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D8708E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoTextCol: { flex: 1, gap: 10 },
  photoHint: { fontSize: 13, color: '#999', lineHeight: 18 },
  changePhotoBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E8C5CE',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  changePhotoBtnText: { fontSize: 13, color: '#1A1A2E', fontWeight: '500' },
  usernameRow: { flexDirection: 'row', alignItems: 'center' },
  usernameText: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  editUsernameContainer: { marginBottom: 10 },
  usernameInput: {
    backgroundColor: '#FCF0F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A2E',
    marginBottom: 12,
  },
  editButtonsRow: { flexDirection: 'row', gap: 10 },
  saveNameBtn: {
    flex: 1,
    backgroundColor: '#D8708E',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveNameText: { color: '#FFFFFF', fontWeight: 'bold' },
  cancelNameBtn: {
    flex: 1,
    backgroundColor: '#FCF0F3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelNameText: { color: '#D8708E', fontWeight: '600' },
  hintText: { fontSize: 12, color: '#AAA', lineHeight: 18, marginTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  infoIcon: { marginRight: 12, marginTop: 2 },
  infoLabel: { fontSize: 12, color: '#AAA', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#1A1A2E', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#F5F5F5' },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLabel: { fontSize: 14, color: '#1A1A2E' },
  adultRow: { flexDirection: 'row', alignItems: 'center' },
  adultLabel: { fontSize: 13, color: '#999', marginBottom: 8 },
  adultBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  adultBadgeText: { fontSize: 13, fontWeight: '600' },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#FDEEF1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#D8708E' },

  // ─── Modal ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#AAA',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalOptionText: { flex: 1 },
  modalOptionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E', marginBottom: 2 },
  modalOptionDesc: { fontSize: 12, color: '#AAA' },
  modalSeparator: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },
  modalCancel: {
    marginTop: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#888' },

  // ─── Modal Advertencia +18 ───
  adultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  adultModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  adultIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDEEF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  adultIconText: { fontSize: 28 },
  adultModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  adultModalSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  adultConfirmBox: {
    backgroundColor: '#FAF7F8',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  adultConfirmHeader: {
    fontSize: 13,
    color: '#1A1A2E',
    fontWeight: '600',
    marginBottom: 12,
  },
  adultBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  adultBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8708E',
    marginTop: 6,
    marginRight: 8,
  },
  adultBulletText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  adultNoteBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  adultNoteText: {
    fontSize: 12,
    color: '#5D4037',
    lineHeight: 16,
  },
  adultButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  adultCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  adultCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  adultConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  adultConfirmText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // ─── Modal Cambiar Contraseña ───
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  hintText: {
    fontSize: 12,
    color: '#D8708E',
    fontWeight: '500',
  },
  passwordButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  passwordCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  passwordCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  passwordConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#D8708E',
    alignItems: 'center',
  },
  passwordConfirmText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
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
