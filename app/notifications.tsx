import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    Switch,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  
  // State for switches
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  
  const [newChapters, setNewChapters] = useState(true);
  const [likes, setLikes] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [purchases, setPurchases] = useState(true);
  const [creatorUpdates, setCreatorUpdates] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

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

  const handleSave = () => {
    showToast('Configuración de notificaciones guardada', 'success');
    setTimeout(() => router.back(), 2000);
  };

  const NotificationItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onValueChange,
    iconType = 'feather'
  }: any) => (
    <View style={styles.itemRow}>
      <View style={styles.iconContainer}>
        {iconType === 'feather' ? (
          <Feather name={icon} size={20} color="#D8708E" />
        ) : (
          <MaterialIcons name={icon} size={20} color="#D8708E" />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#EEE', true: '#E2919E' }}
        thumbColor="#FFF"
      />
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Canales de notificación */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Canales de notificación</Text>
          
          <View style={styles.channelRow}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Notificaciones push</Text>
              <Text style={styles.itemDescription}>Recibe notificaciones en tiempo real</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#EEE', true: '#E2919E' }}
              thumbColor="#FFF"
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.channelRow}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Notificaciones por correo</Text>
              <Text style={styles.itemDescription}>Recibe resúmenes por email</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#EEE', true: '#E2919E' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Tipos de notificaciones */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Tipos de notificaciones</Text>
          
          <NotificationItem
            icon="book-open"
            title="Nuevos capítulos"
            description="Cuando los webcomics que sigues publican nuevos capítulos"
            value={newChapters}
            onValueChange={setNewChapters}
          />
          
          <View style={styles.divider} />
          
          <NotificationItem
            icon="heart"
            title="Me gusta"
            description="Cuando alguien le da me gusta a tu contenido"
            value={likes}
            onValueChange={setLikes}
          />
          
          <View style={styles.divider} />
          
          <NotificationItem
            icon="trending-up"
            title="Nuevos seguidores"
            description="Cuando alguien comienza a seguirte"
            value={newFollowers}
            onValueChange={setNewFollowers}
          />
          
          <View style={styles.divider} />
          
          <NotificationItem
            icon="attach-money"
            iconType="material"
            title="Compras y monedas"
            description="Confirmaciones de compras y transacciones"
            value={purchases}
            onValueChange={setPurchases}
          />
          
          <View style={styles.divider} />
          
          <NotificationItem
            icon="bell"
            title="Actualizaciones de creadores"
            description="Anuncios y noticias de tus creadores favoritos"
            value={creatorUpdates}
            onValueChange={setCreatorUpdates}
          />
          
          <View style={styles.divider} />
          
          <NotificationItem
            icon="bell"
            title="Notificaciones del sistema"
            description="Actualizaciones y mantenimiento de Mangaty"
            value={systemNotifications}
            onValueChange={setSystemNotifications}
          />
        </View>

        {/* Nota */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            <Text style={{ fontWeight: 'bold' }}>Nota: </Text>
            Las notificaciones de seguridad y cambios importantes en tu cuenta siempre se enviarán, independientemente de esta configuración.
          </Text>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Guardar configuración</Text>
        </TouchableOpacity>

      </ScrollView>

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
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FCF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E', marginBottom: 2 },
  itemDescription: { fontSize: 12, color: '#999', lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 12 },
  noteBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  noteText: { fontSize: 13, color: '#5D4037', lineHeight: 20 },
  saveButton: {
    backgroundColor: '#D8708E',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#D8708E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
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
