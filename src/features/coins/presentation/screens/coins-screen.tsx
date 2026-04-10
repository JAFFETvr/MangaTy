import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert, Image, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TYPOGRAPHY } from '@/src/core/theme/typography';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { CoinStoreViewModel } from '../view-models/coin-store-view-model';

export function CoinsScreen() {
  const insets = useSafeAreaInsets();
  
  // --- Clean Architecture DI ---
  const [viewModel] = useState<CoinStoreViewModel>(() => serviceLocator.get(DIKeys.COIN_STORE_VIEW_MODEL));
  const [state, setState] = useState(viewModel.getState());
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe((newState) => {
      setState(newState);
      if (newState.error && !state.error) {
        setErrorMessage(newState.error);
        setShowError(true);
        setTimeout(() => setShowError(false), 4000);
      }
    });

    viewModel.loadData();

    return unsubscribe;
  }, [viewModel]);

  const handleBuyPackage = async (packageId: string) => {
    if (processingPackageId) return;
    setProcessingPackageId(packageId);

    const checkoutUrl = await viewModel.checkout(packageId);

    if (checkoutUrl) {
      await Linking.openURL(checkoutUrl);
      // Mostrar notificación de éxito al regresar del navegador
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    }

    setProcessingPackageId(null);
  };

  // --- Helpers UI ---
  // Mapa de imágenes por cantidad de monedas desde assets
  // Para cambiar la imagen de un paquete, reemplaza el archivo correspondiente en assets/images/
  const packageImageMap: Record<number, ImageSourcePropType> = {
    100:  require('@/assets/images/100.png'),
    250:  require('@/assets/images/250.png'),
    600:  require('@/assets/images/600.png'),
    1300: require('@/assets/images/1300.png'),
  };

  const getPackageImage = (coins: number): ImageSourcePropType | null => {
    // Busca la imagen exacta; si no existe devuelve null para usar fallback
    return packageImageMap[coins] ?? null;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header Fijo */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tienda de Monedas</Text>
      </View>

      {/* Toast de Pago Exitoso */}
      {showSuccess && (
        <View style={styles.successToast} pointerEvents="none">
          <View style={styles.successIconCircle}>
            <Feather name="check" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.successToastText}>¡Pago realizado con éxito!</Text>
        </View>
      )}

      {/* Toast de Error */}
      {showError && (
        <View style={styles.errorToast} pointerEvents="none">
          <View style={styles.errorIconCircle}>
            <Feather name="alert-circle" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.errorToastText}>{errorMessage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tarjeta de Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceSubtitle}>Tu balance actual</Text>
          <View style={styles.balanceRow}>
            <Image
              source={require('@/assets/images/moneda.png')}
              style={styles.coinImage}
              resizeMode="contain"
            />
            <Text style={styles.balanceNumber}>
              {state.balance === 0 ? '0' : state.balance.toLocaleString()}
            </Text>
            <Text style={styles.balanceText}> {state.balance === 1 ? 'Moneda' : 'Monedas'}</Text>
          </View>
          <Text style={styles.balanceFooter}>Cada capítulo premium cuesta 25 Monedas</Text>
        </View>

        {/* Listado de Paquetes Dinámicos */}
        <Text style={styles.sectionTitle}>Paquetes de Monedas</Text>

        {state.isLoading ? (
          <ActivityIndicator size="large" color="#D8708E" style={{ marginVertical: 40 }} />
        ) : (
          <View style={styles.packagesContainer}>
            {state.packages
              .filter((pkg) => pkg.coins !== 3500) // Quitar paquete 3500
              .map((pkg) => {
              const badge = pkg.coins === 250
                ? { text: '🏷️ Mejor Precio', color: '#4CAF82' }
                : pkg.popular ? { text: '✨ Más Popular', color: '#D8708E' }
                : pkg.best ? { text: '✨ Mejor Valor', color: '#DDBDC6' }
                : null;
              const isProcessing = processingPackageId === pkg.id;
              const pkgImage = getPackageImage(pkg.coins);

              return (
                <View key={pkg.id} style={styles.packageCard}>
                  {/* Imagen del paquete desde assets/images/{coins}.png */}
                  <View style={styles.packageIconBlock}>
                    {pkgImage ? (
                      <Image source={pkgImage} style={styles.packageImage} resizeMode="contain" />
                    ) : (
                      // Fallback visual si no existe imagen para esa cantidad
                      <View style={styles.packageImageFallback}>
                        <Text style={styles.packageImageFallbackText}>🪙</Text>
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageCoins}>
                      {pkg.coins} <Text style={styles.packageCoinsText}>Monedas</Text>
                    </Text>
                  </View>

                  {/* Chapa Dinámica ("Más popular", etc) (Si existe) */}
                  {badge && (
                    <View style={[styles.badgeContainer, { backgroundColor: badge.color }]}>
                      <Text style={styles.badgeText}>{badge.text}</Text>
                    </View>
                  )}

                  {/* Botón Compra Dinámico */}
                  <TouchableOpacity
                    style={styles.priceButton}
                    onPress={() => handleBuyPackage(pkg.id)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#1A1A2E" />
                    ) : (
                      <Text style={styles.priceButtonText}>{`$${pkg.priceMXN} MXN`}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Panel Informativo */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoPanelTitle}>💡 ¿Cómo funcionan las Monedas?</Text>
          <Text style={styles.infoPanelSection}>
            <Text style={styles.infoPanelBold}>Acceso Total: </Text>
            Desbloquea capítulos exclusivos y premium de tus historias favoritas.
          </Text>
          <Text style={styles.infoPanelSection}>
            <Text style={styles.infoPanelBold}>Apoyo Real: </Text>
            Tus monedas van directamente a los creadores que amas.
          </Text>
          <Text style={styles.infoPanelSection}>
            <Text style={styles.infoPanelBold}>Sin Presiones: </Text>
            Tus Monedas no caducan nunca; úsalas cuando quieras.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Estilos Estrictamente Recreados según el Mockup ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#D8708E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  balanceSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinImage: {
    width: 42,
    height: 42,
    marginRight: 10,
  },
  balanceNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  balanceText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  balanceFooter: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  packagesContainer: {
    marginBottom: 24,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F6E9EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  packageIconBlock: {
    marginRight: 16,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageImage: {
    width: 56,
    height: 56,
  },
  packageImageFallback: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
  },
  packageImageFallbackText: {
    fontSize: 28,
  },
  packageInfo: {
    flex: 1,
  },
  packageCoins: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  packageCoinsText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  priceButton: {
    backgroundColor: '#F6E9EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: 'center',
  },
  priceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoPanel: {
    backgroundColor: '#FCF7F8',
    borderRadius: 16,
    padding: 24,
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 16,
  },
  infoPanelSection: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  infoPanelBold: {
    fontWeight: 'bold',
    color: '#D8708E',
  },
  // --- Toast de Éxito ---
  successToast: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF82',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  successToastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // --- Toast de Error ---
  errorToast: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    zIndex: 999,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  errorIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  errorToastText: {
    color: '#D12822',
    fontSize: 14,
    fontWeight: '600',
  },
});
