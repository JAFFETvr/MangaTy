/**
 * UnlockChapterButton - Button to unlock a chapter with coins
 */

import { colors } from '@/src/core/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UnlockChapterButtonProps {
  chapterNumber: number;
  cost: number;
  userBalance: number;
  isUnlocked: boolean;
  isUnlocking: boolean;
  onUnlock: () => Promise<void>;
  onInsufficientCoins: () => void;
}

export const UnlockChapterButton: React.FC<UnlockChapterButtonProps> = ({
  chapterNumber,
  cost,
  userBalance,
  isUnlocked,
  isUnlocking,
  onUnlock,
  onInsufficientCoins,
}) => {
  const hasEnoughCoins = userBalance >= cost;

  const handlePress = () => {
    if (isUnlocked) return;

    if (!hasEnoughCoins) {
      onInsufficientCoins();
      return;
    }

    Alert.alert(
      'Desbloquear Capítulo',
      `¿Deseas desbloquear el Capítulo ${chapterNumber} por ${cost} monedas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desbloquear', onPress: onUnlock },
      ]
    );
  };

  if (isUnlocked) {
    return (
      <View style={styles.unlockedContainer}>
        <Ionicons name="checkmark-circle" size={20} color={colors.pink} />
        <Text style={styles.unlockedText}>Desbloqueado</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        !hasEnoughCoins && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      disabled={isUnlocking}
    >
      {isUnlocking ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name="lock-open" size={16} color="#fff" />
          <Text style={styles.buttonText}>{cost}</Text>
          <Ionicons name="logo-bitcoin" size={14} color="#F5C518" />
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    color: colors.pink,
    fontWeight: '600',
    fontSize: 12,
  },
});
