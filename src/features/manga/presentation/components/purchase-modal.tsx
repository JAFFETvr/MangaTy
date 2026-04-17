import { Chapter } from '@/src/features/manga/domain/entities/chapter';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PurchaseModalProps {
  visible: boolean;
  chapter: Chapter | null;
  userCoins: number;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onGoToCoins: () => void;
}

export function PurchaseModal({
  visible,
  chapter,
  userCoins,
  isLoading,
  onClose,
  onConfirm,
  onGoToCoins,
}: PurchaseModalProps) {
  if (!chapter) return null;
  const chapterPrice = chapter.priceTyCoins || 25;
  const hasInsufficientCoins = userCoins < chapterPrice;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Comprar Capítulo</Text>
          
          <View style={styles.chapterCard}>
            <Text style={styles.chapterLabel}>
              Cap. {chapter.chapterNumber}: {chapter.title}
            </Text>
            
            <View style={styles.priceRow}>
              <FontAwesome5 name="coins" size={24} color="#F5A623" />
              <Text style={styles.priceValue}>{chapterPrice}</Text>
              <Text style={styles.priceCurrency}>Monedas</Text>
            </View>

            <Text style={styles.balanceText}>
              Saldo actual: <Text style={styles.balanceValue}>{userCoins}</Text> monedas
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={hasInsufficientCoins ? onGoToCoins : onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.confirmText}>
                  {hasInsufficientCoins ? 'Comprar monedas' : 'Comprar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 20,
  },
  chapterCard: {
    width: '100%',
    backgroundColor: '#FEF8F9',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEEBED',
  },
  chapterLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  priceCurrency: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  balanceText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  balanceValue: {
    color: '#1A1A2E',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F0F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FF80AB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
