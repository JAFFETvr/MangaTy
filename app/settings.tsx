import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { ProfileViewModel } from '@/src/features/user/presentation/view-models/profile-view-model';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
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
  const [adultContent, setAdultContent] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAdultWarning, setShowAdultWarning] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadUser();
    // Cargar preferencia de adultos guardada
    AsyncStorage.getItem('@mangaty_adult_content').then((adult) => {
      if (adult === 'true') setAdultContent(true);
    });
    return unsubscribe;
  }, [viewModel]);

  const user = state.user;

  // Cargar foto específica del usuario cuando su info esté disponible
  useEffect(() => {
    if (user?.email) {
      AsyncStorage.getItem(getPhotoStorageKey(user.email)).then((saved) => {
        setPhotoUri(saved || null);
      });
    }
  }, [user?.email]);

  const savePhoto = async (uri: string) => {
    try {
      // Si es un file:// URI, convertir a base64 y luego a blob URL
      let finalUri = uri;
      if (uri.startsWith('file://')) {
        try {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          // Crear blob URL (más eficiente para display)
          const blob = await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob());
          finalUri = URL.createObjectURL(blob);
          console.log('✅ Foto guardada como blob URL');
        } catch (error) {
          console.error('Error convirtiendo foto:', error);
          // Fallback: usar data URI
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          finalUri = `data:image/jpeg;base64,${base64}`;
        }
      }
      setPhotoUri(finalUri);
      if (user?.email) {
        // Guardar la URL/data URI para persistencia
        await AsyncStorage.setItem(getPhotoStorageKey(user.email), finalUri);
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'No se pudo guardar la foto');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Iniciando logout...');
              await viewModel.performLogout();
              console.log('🚪 Logout completado, redirigiendo...');

              // Limpiar AsyncStorage de datos sensibles
              await AsyncStorage.removeItem('auth_token');
              await AsyncStorage.removeItem('auth_user');

              // Redirigir a login
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('❌ Error en logout:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión correctamente');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña actual');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // TODO: Implementar cambio de contraseña en el backend cuando esté disponible
    Alert.alert(
      'Éxito',
      'Tu contraseña ha sido cambiada correctamente',
      [{ text: 'OK', onPress: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
      }}]
    );
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
            <TouchableOpacity>
              <Text style={styles.editLink}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.usernameRow}>
            <Feather name="user" size={16} color="#999" style={{ marginRight: 8 }} />
            <Text style={styles.usernameText}>
              {user?.name && user.name !== 'Usuario' ? user.name : 'Sin nombre'}
            </Text>
          </View>
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
            { label: 'Privacidad', icon: 'shield', action: () => Alert.alert('Privacidad', 'Pronto disponible') },
            { label: 'Notificaciones', icon: 'bell', action: () => Alert.alert('Notificaciones', 'Pronto disponible') },
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

        {/* Contenido para Adultos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contenido para adultos</Text>
          <View style={styles.adultRow}>
            <Feather name="eye" size={20} color="#999" style={{ marginRight: 14 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.adultLabel}>Permitir contenido para adultos</Text>
              <TouchableOpacity
                style={[styles.adultBadge, { backgroundColor: adultContent ? '#D8708E22' : '#F5F5F5' }]}
                onPress={() => {
                  if (!adultContent) {
                    // Mostrar advertencia antes de habilitar
                    setShowAdultWarning(true);
                  } else {
                    // Deshabilitar directo y borrar preferencia
                    setAdultContent(false);
                    AsyncStorage.removeItem('@mangaty_adult_content');
                  }
                }}
              >
                <Text style={[styles.adultBadgeText, { color: adultContent ? '#D8708E' : '#999' }]}>
                  {adultContent ? 'Habilitado' : 'Deshabilitado'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
              <TouchableOpacity style={styles.passwordConfirmBtn} onPress={handleChangePassword}>
                <Text style={styles.passwordConfirmText}>Cambiar contraseña</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── Modal Advertencia +18 ─── */}
      <Modal
        visible={showAdultWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdultWarning(false)}
      >
        <View style={styles.adultOverlay}>
          <View style={styles.adultModal}>
            {/* Icono advertencia */}
            <View style={styles.adultIconWrapper}>
              <Text style={styles.adultIconText}>⚠️</Text>
            </View>

            <Text style={styles.adultModalTitle}>Advertencia de contenido +18</Text>
            <Text style={styles.adultModalSubtitle}>
              Estás a punto de habilitar contenido para adultos
            </Text>

            {/* Lista de confirmaciones */}
            <View style={styles.adultConfirmBox}>
              <Text style={styles.adultConfirmHeader}>Al continuar, confirmas que:</Text>
              {[
                'Eres mayor de 18 años',
                'Comprendes que verás contenido clasificado para adultos',
                'Podrás desactivar esta opción en cualquier momento',
              ].map((item) => (
                <View key={item} style={styles.adultBulletRow}>
                  <View style={styles.adultBullet} />
                  <Text style={styles.adultBulletText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Nota importante */}
            <View style={styles.adultNoteBox}>
              <Text style={styles.adultNoteText}>
                <Text style={{ fontWeight: '700' }}>Importante: </Text>
                Esta configuración afectará el contenido que puedes ver en Mangaty. Asegúrate de estar en un entorno apropiado.
              </Text>
            </View>

            {/* Botones */}
            <View style={styles.adultButtonRow}>
              <TouchableOpacity
                style={styles.adultCancelBtn}
                onPress={() => setShowAdultWarning(false)}
              >
                <Text style={styles.adultCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adultConfirmBtn}
                onPress={() => {
                  setAdultContent(true);
                  AsyncStorage.setItem('@mangaty_adult_content', 'true');
                  setShowAdultWarning(false);
                }}
              >
                <Text style={styles.adultConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  usernameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  usernameText: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  hintText: { fontSize: 12, color: '#AAA', lineHeight: 18 },
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
});
