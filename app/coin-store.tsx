/**
 * CoinStoreScreen - Tienda de monedas
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { CoinStoreViewModel } from '@/src/features/coins/presentation';
import { useMVVM, useStateFlow } from '@/src/shared/hooks';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.pink,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.black,
    fontSize: TYPOGRAPHY.sizes['2xl'],
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  balance: {
    backgroundColor: COLORS.yellow,
    marginVertical: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    color: '#333',
  },
  freeAd: {
    backgroundColor: COLORS.pink,
    marginVertical: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  freeAdLeft: {
    flex: 1,
  },
  freeAdTitle: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  freeAdSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  freeAdBtn: {
    backgroundColor: '#fff',
    color: COLORS.pink,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 8,
  },
  freeAdIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  sectionTitle: {
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    marginVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  coinPkg: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  coinPkgIcon: {
    fontSize: 18,
  },
  coinPkgAmount: {
    fontWeight: TYPOGRAPHY.weights.black,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  coinPkgBonus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.pink,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  coinPkgPrice: {
    backgroundColor: COLORS.pink,
    color: '#fff',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 4,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tienda de Monedas</Text>
          <Text style={styles.headerSubtitle}>
            Desbloquea tus mangas favoritos
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content}>
        {state.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.pink} />
          </View>
        ) : (
          <>
            {/* Balance */}
            <Text style={styles.balance}>
              💰 Tu saldo: {state.balance}
            </Text>

            {/* Free ad */}
            <View style={styles.freeAd}>
              <View style={styles.freeAdLeft}>
                <Text style={styles.freeAdTitle}>Monedas Gratis</Text>
                <Text style={styles.freeAdSub}>
                  +10 monedas por cada anuncio
                </Text>
                <TouchableOpacity>
                  <Text style={styles.freeAdBtn}>Ver Anuncio Ahora</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.freeAdIcon}>▶️</Text>
            </View>

            {/* Packages */}
            <Text style={styles.sectionTitle}>Paquetes Especiales</Text>

            <View style={styles.grid}>
              {state.packages.slice(0, 2).map((pkg) => (
                <View key={pkg.id} style={styles.coinPkg}>
                  <Text style={styles.coinPkgIcon}>💰</Text>
                  <Text style={styles.coinPkgAmount}>{pkg.coins}</Text>
                  {pkg.bonus > 0 && (
                    <Text style={styles.coinPkgBonus}>+{pkg.bonus} bonus</Text>
                  )}
                  <TouchableOpacity>
                    <Text style={styles.coinPkgPrice}>${pkg.price}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Popular package */}
            {state.packages.slice(2, 3).map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.coinPkg,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    backgroundColor: 'rgba(233, 30, 140, 0.15)',
                    borderWidth: 2,
                    borderColor: COLORS.pink,
                    marginVertical: 10,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#FFD6EC',
                      borderRadius: 18,
                      width: 36,
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>💰</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontWeight: TYPOGRAPHY.weights.black,
                        fontSize: TYPOGRAPHY.sizes.lg,
                      }}
                    >
                      {pkg.coins}
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.sizes.xs,
                        color: COLORS.pink,
                        fontWeight: TYPOGRAPHY.weights.bold,
                      }}
                    >
                      +{pkg.bonus} bonus
                    </Text>
                  </View>
                </View>
                <Text style={styles.coinPkgPrice}>${pkg.price}</Text>
              </TouchableOpacity>
            ))}

            {/* Best value */}
            {state.packages.slice(3, 4).map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.coinPkg,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    backgroundColor: COLORS.yellow,
                    marginVertical: 10,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: 18,
                      width: 36,
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>⚡</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontWeight: TYPOGRAPHY.weights.black,
                        fontSize: TYPOGRAPHY.sizes.lg,
                        color: '#333',
                      }}
                    >
                      {pkg.coins}
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.sizes.xs,
                        color: '#E65100',
                        fontWeight: TYPOGRAPHY.weights.bold,
                      }}
                    >
                      +{pkg.bonus} bonus
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.coinPkgPrice,
                    { backgroundColor: '#E65100' },
                  ]}
                >
                  <Text style={{ color: '#fff' }}>${pkg.price}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}

            {/* Info */}
            <View
              style={{
                backgroundColor: '#FFF3F9',
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                marginVertical: 14,
              }}
            >
              <Text
                style={{
                  color: COLORS.pink,
                  fontWeight: TYPOGRAPHY.weights.bold,
                }}
              >
                Sobre las Monedas
              </Text>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.sizes.xs,
                  color: COLORS.textMuted,
                  marginTop: 4,
                }}
              >
                Usa tus monedas para desbloquear capítulos premium de
                cualquier manga. También puedes ganar monedas gratis viendo
                anuncios. 🎉
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
