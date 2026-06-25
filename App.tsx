import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '@/utils/store';
import { Storage } from '@/services/storage';
import { setAPIKeys } from '@/services/api';
import { AuthService } from '@/services/auth';
import AuthScreen from '@/screens/AuthScreen';
import ChatScreen from '@/screens/ChatScreen';
import ModelsScreen from '@/screens/ModelsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

function TabBar() {
  const colors = useStore((s) => s.colors);
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const tabs = [
    { key: 'chat' as const, icon: '💬', label: 'Chat' },
    { key: 'models' as const, icon: '⭐', label: 'Models' },
    { key: 'settings' as const, icon: '⚙️', label: 'Settings' },
  ];

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.tabBar, borderColor: colors.glassBorder }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isActive && { transform: [{ scale: 1.1 }] }]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.accent : colors.textSecondary },
                isActive && { fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainScreen() {
  const activeTab = useStore((s) => s.activeTab);

  return (
    <View style={styles.mainContainer}>
      {activeTab === 'chat' && <ChatScreen />}
      {activeTab === 'models' && <ModelsScreen />}
      {activeTab === 'settings' && <SettingsScreen />}
      <TabBar />
    </View>
  );
}

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    loadSavedState();
    const unsubscribe = AuthService.onAuthChanged((user) => {
      if (user) {
        setUser(user.name || 'User', user.email || '');
      }
    });
    return unsubscribe;
  }, []);

  const loadSavedState = async () => {
    try {
      const user = await Storage.getUser();
      if (user) {
        setUser(user.name, user.email);
      }

      const [openaiKey, anthropicKey, geminiKey, model, theme] = await Promise.all([
        Storage.getOpenAIKey(),
        Storage.getAnthropicKey(),
        Storage.getGeminiKey(),
        Storage.getModel(),
        Storage.getTheme(),
      ]);

      const store = useStore.getState();
      if (model) store.setModel(model);
      if (theme) store.setTheme(theme as any);

      setAPIKeys({ openaiKey, anthropicKey, geminiKey });
      store.setOpenAIKey(openaiKey);
      store.setAnthropicKey(anthropicKey);
      store.setGeminiKey(geminiKey);
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" translucent />
        {isAuthenticated ? <MainScreen /> : <AuthScreen />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mainContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
});
