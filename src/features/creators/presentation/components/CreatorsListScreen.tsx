/**
 * CreatorsListScreen - Browse all creators
 */

import { colors } from '@/src/core/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { CreatorCard } from '../components';
import { CreatorViewModel } from '../view-models';

export const CreatorsListScreen: React.FC = () => {
  const router = useRouter();
  const [viewModel] = useState(() => new CreatorViewModel());
  const [state, setState] = useState(viewModel.getState());

  useEffect(() => {
    const unsubscribe = viewModel.state$.subscribe(setState);
    viewModel.loadAllCreators();
    return unsubscribe;
  }, []);

  const handleCreatorPress = (creatorId: string) => {
    router.push(`/creator/${creatorId}`);
  };

  if (state.isLoading && state.creators.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.pink} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Creadores</Text>
      <FlatList
        data={state.creators}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={state.isLoading}
            onRefresh={() => viewModel.loadAllCreators()}
          />
        }
        renderItem={({ item }) => (
          <CreatorCard
            creator={item}
            onPress={() => handleCreatorPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay creadores</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
  },
});

export default CreatorsListScreen;
