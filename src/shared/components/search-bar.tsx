/**
 * SearchBar Component - Search input field
 */

import { COLORS, TYPOGRAPHY } from '@/src/core/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    padding: 0,
  },
});

export function SearchBar({
  placeholder = 'Buscar manga...',
  onSearch,
}: SearchBarProps): React.ReactElement {
  const [query, setQuery] = useState('');

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16 }}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={handleChangeText}
      />
    </View>
  );
}
