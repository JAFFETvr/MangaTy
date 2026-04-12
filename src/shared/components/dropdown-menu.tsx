/**
 * DropdownMenu Component - User dropdown menu
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuItem {
  label: string;
  icon: string;
  badge?: string;
  onPress: () => void;
  isLogout?: boolean;
}

interface DropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  items: MenuItem[];
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 10,
    width: 200,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.pink,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
  },
  headerTextContent: {},
  headerName: {
    fontWeight: TYPOGRAPHY.weights.extrabold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: '#fff',
  },
  headerEmail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    opacity: 0.8,
    color: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemIcon: {
    fontSize: 16,
  },
  itemLabel: {
    flex: 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
  },
  itemBadge: {
    backgroundColor: COLORS.pink,
    color: '#fff',
    borderRadius: 12,
    paddingVertical: 1,
    paddingHorizontal: 8,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.extrabold,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: COLORS.pink,
  },
});

export function DropdownMenu({
  visible,
  onClose,
  userName,
  userEmail,
  items,
}: DropdownMenuProps): React.ReactElement {
  const handleItemPress = (item: MenuItem) => {
    item.onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.dropdown}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>👤</View>
            <View style={styles.headerTextContent}>
              <Text style={styles.headerName}>{userName}</Text>
              <Text style={styles.headerEmail}>{userEmail}</Text>
            </View>
          </View>

          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.item, item.isLogout && styles.logoutItem]}
              onPress={() => handleItemPress(item)}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.itemLabel,
                  item.isLogout && styles.logoutText,
                ]}
              >
                {item.label}
              </Text>
              {item.badge && (
                <Text style={styles.itemBadge}>{item.badge}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
