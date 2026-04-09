/**
 * CoinStoreScreen - Tienda de monedas
 */

import { COLORS } from '@/src/core/theme';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { CoinStoreViewModel } from '@/src/features/coins/presentation';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const COIN_PACKAGES = [
  { id: 1, coins: 100, price: 1.0, currency: 'USD', icon: '🪙' },
  { id: 2, coins: 250, price: 2.25, currency: 'USD', icon: '🏺', popular: true },
  { id: 3, coins: 600, price: 5.0, currency: 'USD', icon: '🏺' },
  { id: 4, coins: 1300, price: 10.0, currency: 'USD', icon: '🏺' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.base,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceIcon: {
    fontSize: 32,
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 2,
  },
  balanceSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textDark,
    marginBottom: 14,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  packageCardPopular: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(231, 91, 143, 0.05)',
  },
  packageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  packageIcon: {
    fontSize: 32,
  },
  packageInfo: {
    flex: 1,
  },
  packageCoins: {
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.textDark,
  },
  packageDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  packagePrice: {
    backgroundColor: COLORS.primary,
    color: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 70,
  },
  packagePricePopular: {
    backgroundColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 20,
  },
  infoTitle: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 8,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    lineHeight: 16,
  },
  faqContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  faqTitle: {
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  faqItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    lineHeight: 16,
    marginBottom: 8,
  },
  faqBold: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default function CoinStoreScreen() {
  const router = useRouter();
  const viewModel = serviceLocator.get<CoinStoreViewModel>(DIKeys.COIN_STORE_VIEW_MODEL);
  const state = useStateFlow(viewModel.state$);

  useMVVM(
    async () => {
      await viewModel.loadData();
    },
    undefined
  );

  const handlePurchase = (pkg: any) => {
    // TODO: Implement purchase logic
    alert(`Comprar ${pkg.coins} monedas por $${pkg.price}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tienda de Monedas</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {state.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceIcon}>💰</Text>
              <View style={styles.balanceContent}>
                <Text style={styles.balanceLabel}>Tu Balance Actual</Text>
                <Text style={styles.balanceAmount}>{state.balance} Monedas</Text>
                <Text style={styles.balanceSubtext}>Cada capítulo premium cuesta 25 Monedas</Text>
              </View>
            </View>

            {/* Packages Section */}
            <Text style={styles.sectionTitle}>Paquetes de Monedas</Text>

            {COIN_PACKAGES.map((pkg) => (
              <View
                key={pkg.id}
                style={pkg.popular ? { position: 'relative', marginTop: 8 } : undefined}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>🌟 Popular</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.packageCard,
                    pkg.popular && styles.packageCardPopular,
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  activeOpacity={0.7}
                >
                  <View style={styles.packageLeft}>
                    <Text style={styles.packageIcon}>{pkg.icon}</Text>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageCoins}>{pkg.coins} Monedas</Text>
                      <Text style={styles.packageDescription}>
                        {Math.round((pkg.coins / pkg.price) * 100) / 100} monedas por USD
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.packagePrice, pkg.popular && styles.packagePricePopular]}
                    onPress={() => handlePurchase(pkg)}
                  >
                    <Text style={styles.packagePrice}>
                      ${pkg.price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            ))}

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>¿Cómo funcionan las Monedas?</Text>
              <Text style={styles.infoText}>
                Acceso Total: Desbloquea capítulos y premium de los mangas.{'\n\n'}
                Compra Segura: Tus transacciones son directas y seguras.{'\n\n'}
                Sin Problemas: Tus monedas no caducan.
              </Text>
            </View>

            {/* FAQ Section */}
            <View style={styles.faqContainer}>
              <Text style={styles.faqTitle}>Beneficios de Monedas</Text>
              <Text style={styles.faqItem}>
                <Text style={styles.faqBold}>Sin Presiones:</Text> Tus Monedas se deducen cuando las usas.{'\n\n'}
                <Text style={styles.faqBold}>Sin Suscripción:</Text> No tienes que pagar membresía mensual.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

