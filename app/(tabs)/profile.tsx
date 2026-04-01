/**
 * ProfileScreen - Tab 3 - Perfil de usuario
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { ProfileViewModel } from '@/src/features/user/presentation';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroBg: {
    backgroundColor: COLORS.pink,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  userName: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    marginTop: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  memberBadge: {
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberBadgeText: {
    color: '#333',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: {
    fontWeight: TYPOGRAPHY.weights.black,
    fontSize: TYPOGRAPHY.sizes['3xl'],
    color: COLORS.text,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  sectionTitle: {
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  menuSub: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.pink,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: COLORS.pink,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    paddingBottom: 16,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default function ProfileScreen() {
  const router = useRouter();
  const viewModel = serviceLocator.get<ProfileViewModel>(DIKeys.PROFILE_VIEW_MODEL);
  const state = useStateFlow(viewModel.state$);

  useMVVM(
    async () => {
      await viewModel.loadUser();
    },
    undefined
  );

  if (!state.user) {
    return (
      <View style={styles.container}>
        <View style={styles.heroBg} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.pink} />
        </View>
      </View>
    );
  }

  const { user } = state;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroBg}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="star" size={12} color="#333" />
            <Text style={styles.memberBadgeText}>Miembro</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.stats.mangasRead}</Text>
            <Text style={styles.statLabel}>Mangas Leídos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.stats.favorites}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.stats.chaptersRead}</Text>
            <Text style={styles.statLabel}>Capítulos</Text>
          </View>
        </View>

        {/* Monetization Section - NEW */}
        <Text style={styles.sectionTitle}>Monetización</Text>
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/wallet')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFE8D6' }]}>
                <Ionicons name="wallet" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.menuLabel}>Mi Wallet</Text>
                <Text style={styles.menuSub}>Balance y transacciones</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/coin-store')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="diamond" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.menuLabel}>Comprar Monedas</Text>
                <Text style={styles.menuSub}>Paquetes y ofertas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => router.push('/creator-dashboard')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFD6EC' }]}>
                <Ionicons name="analytics" size={20} color={COLORS.pink} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Dashboard Creador</Text>
                <Text style={styles.menuSub}>Ganancias y estadísticas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Mi Cuenta</Text>
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#E8D6FF' }]}>
                <Ionicons name="pencil" size={20} color="#7C3AED" />
              </View>
              <View>
                <Text style={styles.menuLabel}>Editar Perfil</Text>
                <Text style={styles.menuSub}>Nombre, foto, biografía</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#D6E4FF' }]}>
                <Ionicons name="mail" size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.menuLabel}>Email</Text>
                <Text style={styles.menuSub}>{user.email}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="settings" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.menuLabel}>Configuración</Text>
                <Text style={styles.menuSub}>Notificaciones, privacidad</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Soporte</Text>
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="help-circle" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.menuLabel}>Centro de Ayuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text" size={20} color="#D97706" />
              </View>
              <Text style={styles.menuLabel}>Términos y Condiciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
              </View>
              <Text style={styles.menuLabel}>Política de Privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => viewModel.performLogout()}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.pink} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </View>
  );
}
