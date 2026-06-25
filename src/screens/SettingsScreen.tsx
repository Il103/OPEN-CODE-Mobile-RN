import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/utils/store';
import { setAPIKeys } from '@/services/api';
import { Storage } from '@/services/storage';
import { AuthService } from '@/services/auth';
import { ThemeName } from '@/theme';
import { Spacing, FontSize, BorderRadius } from '@/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useStore((s) => s.colors);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const userName = useStore((s) => s.userName);
  const userEmail = useStore((s) => s.userEmail);
  const logout = useStore((s) => s.logout);

  const [openaiKey, setOpenaiKey] = React.useState('');
  const [anthropicKey, setAnthropicKey] = React.useState('');
  const [geminiKey, setGeminiKey] = React.useState('');

  const storeSetOpenAIKey = useStore((s) => s.setOpenAIKey);
  const storeSetAnthropicKey = useStore((s) => s.setAnthropicKey);
  const storeSetGeminiKey = useStore((s) => s.setGeminiKey);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const [openai, anthropic, gemini] = await Promise.all([
      Storage.getOpenAIKey(),
      Storage.getAnthropicKey(),
      Storage.getGeminiKey(),
    ]);
    setOpenaiKey(openai);
    setAnthropicKey(anthropic);
    setGeminiKey(gemini);
  };

  const saveOpenAI = useCallback(
    async (key: string) => {
      setOpenaiKey(key);
      await Storage.setOpenAIKey(key);
      storeSetOpenAIKey(key);
      setAPIKeys({ openaiKey: key });
    },
    [storeSetOpenAIKey],
  );

  const saveAnthropic = useCallback(
    async (key: string) => {
      setAnthropicKey(key);
      await Storage.setAnthropicKey(key);
      storeSetAnthropicKey(key);
      setAPIKeys({ anthropicKey: key });
    },
    [storeSetAnthropicKey],
  );

  const saveGemini = useCallback(
    async (key: string) => {
      setGeminiKey(key);
      await Storage.setGeminiKey(key);
      storeSetGeminiKey(key);
      setAPIKeys({ geminiKey: key });
    },
    [storeSetGeminiKey],
  );

  const handleThemeChange = async (t: ThemeName) => {
    setTheme(t);
    await Storage.setTheme(t);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AuthService.signOut();
          await Storage.clearUser();
          logout();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={[colors.bg, colors.accent + '06', colors.bg]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Profile */}
        <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{userName}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{userEmail}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={[styles.signOutText, { color: colors.accent3 }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* API Keys */}
        <Section title="API Configuration" colors={colors}>
          <SettingItem label="OpenAI API Key" desc="For GPT-4, GPT-3.5 models" colors={colors}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.glassBorder, backgroundColor: colors.inputBg }]}
              placeholder="sk-..."
              placeholderTextColor={colors.textSecondary + '60'}
              value={openaiKey}
              onChangeText={saveOpenAI}
              secureTextEntry
              autoCapitalize="none"
            />
          </SettingItem>
          <SettingItem label="Anthropic API Key" desc="For Claude models" colors={colors}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.glassBorder, backgroundColor: colors.inputBg }]}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.textSecondary + '60'}
              value={anthropicKey}
              onChangeText={saveAnthropic}
              secureTextEntry
              autoCapitalize="none"
            />
          </SettingItem>
          <SettingItem label="Google AI Key" desc="For Gemini models" colors={colors}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.glassBorder, backgroundColor: colors.inputBg }]}
              placeholder="AI..."
              placeholderTextColor={colors.textSecondary + '60'}
              value={geminiKey}
              onChangeText={saveGemini}
              secureTextEntry
              autoCapitalize="none"
            />
          </SettingItem>
        </Section>

        {/* Theme */}
        <Section title="Appearance" colors={colors}>
          <View style={[styles.settingCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Choose your preferred theme</Text>
            </View>
            <View style={styles.themeRow}>
              {(['dark', 'light', 'ocean'] as ThemeName[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: theme === t ? colors.accent + '20' : 'transparent',
                      borderColor: theme === t ? colors.accent : colors.glassBorder,
                    },
                  ]}
                  onPress={() => handleThemeChange(t)}
                >
                  <Text style={{ fontSize: 16 }}>{t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '🌊'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Section>

        {/* About */}
        <Section title="About" colors={colors}>
          <View style={[styles.settingCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>v1.0.0</Text>
            </View>
          </View>
          <View style={[styles.settingCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>OPEN CODE Mobile</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>Powered by OPEN CODE</Text>
            </View>
          </View>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, colors, children }: { title: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

function SettingItem({
  label,
  desc,
  colors,
  children,
}: {
  label: string;
  desc: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.settingCard, { backgroundColor: colors.cardBg, borderColor: colors.glassBorder }]}>
      <View style={styles.settingLeft}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{desc}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xxl,
    padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.lg, fontWeight: '600' },
  profileEmail: { fontSize: FontSize.sm, marginTop: 2 },
  signOutText: { fontSize: FontSize.md, fontWeight: '600' },
  section: { marginBottom: Spacing.xxl, paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.sm, paddingLeft: 4, textTransform: 'uppercase' },
  settingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.xs,
  },
  settingLeft: { flex: 1, minWidth: 0 },
  settingLabel: { fontSize: FontSize.md, fontWeight: '500' },
  settingDesc: { fontSize: FontSize.sm, marginTop: 2 },
  input: { maxWidth: 150, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.sm, borderWidth: 1, fontSize: FontSize.sm },
  themeRow: { flexDirection: 'row', gap: Spacing.xs },
  themeBtn: { width: 38, height: 38, borderRadius: BorderRadius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
