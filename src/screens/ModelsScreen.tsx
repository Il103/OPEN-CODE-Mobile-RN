import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MODELS } from '@/services/api';
import { Storage } from '@/services/storage';
import { useStore } from '@/utils/store';
import { Spacing, FontSize, BorderRadius } from '@/theme';

export default function ModelsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useStore((s) => s.colors);
  const currentModel = useStore((s) => s.currentModel);
  const setModel = useStore((s) => s.setModel);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const [search, setSearch] = useState('');

  const allModels = useMemo(() => {
    const models = [
      ...MODELS.free.map((m) => ({ ...m, tier: 'FREE' as const })),
      ...MODELS.premium.map((m) => ({ ...m, tier: 'PREMIUM' as const })),
    ];
    if (!search) return models;
    const q = search.toLowerCase();
    return models.filter((m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = async (modelId: string) => {
    setModel(modelId);
    await Storage.setModel(modelId);
    setActiveTab('chat');
  };

  const renderModel = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: currentModel === item.id ? colors.accent : colors.glassBorder,
        },
        currentModel === item.id && { shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
      ]}
      onPress={() => handleSelect(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.cardProvider, { color: colors.textSecondary }]}>{item.provider}</Text>
      </View>
      <View
        style={[
          styles.badge,
          { backgroundColor: item.tier === 'FREE' ? '#2ecc7120' : colors.accent + '20' },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: item.tier === 'FREE' ? '#2ecc71' : colors.accent },
          ]}
        >
          {item.tier}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={[colors.bg, colors.accent + '06', colors.bg]} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={[styles.title, { color: colors.text }]}>Models</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose your AI model</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.glassBorder }]}>
        <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search models..."
          placeholderTextColor={colors.textSecondary + '60'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={allModels}
        renderItem={renderModel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.5)', marginTop: Spacing.xs },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontSize: FontSize.md },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.sm,
  },
  cardIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 2 },
  cardProvider: { fontSize: FontSize.sm },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
});
