import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DIKeys, serviceLocator } from '@/src/di/service-locator';
import { MonetizationViewModel } from '../view-models/monetization-view-model';

interface Props {
  mangaId: string;
}

export default function MonetizationScreen({ mangaId }: Props) {
  const insets = useSafeAreaInsets();
  const [viewModel] = useState<MonetizationViewModel>(() =>
    serviceLocator.get(DIKeys.MONETIZATION_VIEW_MODEL)
  );
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    return unsubscribe;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Monetización</Text>
          <Text style={styles.headerSubtitle}>holaa</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Connect Stripe */}
        <Text style={styles.sectionLabel}>Conectar cuenta de Stripe</Text>
        <TouchableOpacity style={styles.stripeCard} onPress={() => viewModel.connectStripe()}>
          <View style={styles.stripeIcon}>
            <MaterialIcons name="credit-card" size={24} color="#D8708E" />
          </View>
          <View style={styles.stripeTextContainer}>
            <Text style={styles.stripeTitle}>Conectar con Stripe</Text>
            <Text style={styles.stripeDesc}>
              Conecta tu cuenta para recibir pagos de forma segura
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>

        {/* Balance Section */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Ver saldo acumulado</Text>
        <View style={styles.balanceMainCard}>
          <View style={styles.balanceHeader}>
            <MaterialIcons name="attach-money" size={20} color="#D8708E" />
            <Text style={styles.balanceLabel}>Saldo total</Text>
          </View>
          <Text style={styles.mainBalanceValue}>${state.totalBalance.toFixed(2)}</Text>
          <Text style={styles.balanceGrowthText}>{state.monthlyGrowth} este mes</Text>
        </View>

        <View style={styles.balanceSubRow}>
          <View style={styles.balanceSubCard}>
            <Text style={styles.subLabel}>Disponible</Text>
            <Text style={styles.subValue}>${state.availableBalance.toFixed(2)}</Text>
            <Text style={styles.subStatusReady}>Listo para retirar</Text>
          </View>
          <View style={styles.balanceSubCard}>
            <Text style={styles.subLabel}>Pendiente</Text>
            <Text style={styles.subValue}>${state.pendingBalance.toFixed(2)}</Text>
            <Text style={styles.subStatusPending}>Procesando</Text>
          </View>
        </View>

        {/* History Section */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Historial de ganancias</Text>
        <View style={styles.historyList}>
          {state.transactions.map((t) => (
            <View key={t.id} style={styles.historyItem}>
              <View style={[styles.historyIcon, { backgroundColor: t.status === 'Completado' ? '#E8F5E9' : '#FFF8E1' }]}>
                <Feather name="dollar-sign" size={20} color={t.status === 'Completado' ? '#27AE60' : '#F2994A'} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{t.type}</Text>
                <View style={styles.historyMeta}>
                  <Feather name="calendar" size={12} color="#999" />
                  <Text style={styles.historyDate}>{t.date}</Text>
                </View>
              </View>
              <View style={styles.historyAmountContainer}>
                <Text style={styles.historyAmount}>+${t.amount.toFixed(2)}</Text>
                <Text style={[styles.historyStatus, { color: t.status === 'Completado' ? '#27AE60' : '#F2994A' }]}>
                  {t.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Withdraw Section */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Retirar dinero</Text>
        <View style={styles.withdrawCard}>
          <View style={styles.withdrawIconBack}>
             <MaterialIcons name="credit-card" size={40} color="#666" />
          </View>
          <Text style={styles.withdrawTitle}>Conecta tu cuenta de Stripe</Text>
          <Text style={styles.withdrawDesc}>
            Necesitas conectar una cuenta de Stripe para retirar tu dinero
          </Text>
          <TouchableOpacity style={styles.primaryActionButton}>
             <Text style={styles.primaryActionButtonText}>Conectar Stripe</Text>
          </TouchableOpacity>
        </View>

        {/* Fee Info */}
        <View style={styles.feeInfoArea}>
            <Feather name="info" size={20} color="#D8708E" />
            <View style={{ flex: 1 }}>
                <Text style={styles.feeTitle}>Comisión de Mangaty</Text>
                <Text style={styles.feeDesc}>
                    Mangaty cobra una comisión del 10% por cada venta. Los pagos se procesan de forma segura a través de Stripe.
                </Text>
            </View>
        </View>

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
    fontSize: 12,
    color: '#999',
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  stripeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  stripeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FDF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stripeTextContainer: {
    flex: 1,
  },
  stripeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  stripeDesc: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  balanceMainCard: {
    backgroundColor: '#FFF9FA',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FEEBED',
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#D8708E',
    fontWeight: '500',
  },
  mainBalanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  balanceGrowthText: {
    fontSize: 13,
    color: '#27AE60',
    fontWeight: '500',
  },
  balanceSubRow: {
    flexDirection: 'row',
    gap: 12,
  },
  balanceSubCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  subLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  subValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subStatusReady: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: '500',
  },
  subStatusPending: {
    fontSize: 11,
    color: '#999',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyAmountContainer: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  historyStatus: {
    fontSize: 11,
    fontWeight: '500',
  },
  withdrawCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    alignItems: 'center',
  },
  withdrawIconBack: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  withdrawTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  withdrawDesc: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  primaryActionButton: {
    backgroundColor: '#E2919E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryActionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  feeInfoArea: {
      flexDirection: 'row',
      backgroundColor: '#FFF9FA',
      borderRadius: 16,
      padding: 16,
      marginTop: 24,
      gap: 12,
  },
  feeTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1A1A2E',
      marginBottom: 4,
  },
  feeDesc: {
      fontSize: 12,
      color: '#666',
      lineHeight: 16,
  }
});
