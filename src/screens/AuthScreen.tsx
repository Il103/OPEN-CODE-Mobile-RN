import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService } from '@/services/auth';
import { Storage } from '@/services/storage';
import { useStore } from '@/utils/store';
import { Colors, Spacing, FontSize, BorderRadius } from '@/theme';

const OpenCodeLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoBlock}>
      {[0, 1, 2].map((row) => (
        <View key={row} style={[styles.logoRow, { opacity: 0.8 - row * 0.15 }]}>
          {[0, 1, 2, 3].map((col) => (
            <View
              key={col}
              style={[
                styles.logoCell,
                { backgroundColor: row === 1 && col === 3 ? '#211E1E' : row >= 1 ? '#656363' : '#CFCECD' },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  </View>
);

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const setUser = useStore((s) => s.setUser);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 30,
      friction: 8,
    }).start();
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      const user = await AuthService.signInWithGoogle();
      await Storage.setUser({ name: user.name || '', email: user.email || '' });
      setUser(user.name || 'User', user.email || '', user.photoURL);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const handleEmailAuth = useCallback(async () => {
    if (!email || !password || (mode === 'signup' && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      let user;
      if (mode === 'signup') {
        user = await AuthService.signUp(email, password, name);
      } else {
        user = await AuthService.signInWithEmail(email, password);
      }
      await Storage.setUser({ name: user.name || '', email: user.email || '' });
      setUser(user.name || 'User', user.email || '', user.photoURL);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, name, setUser]);

  const theme = useStore((s) => s.colors);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <LinearGradient
        colors={[theme.bg, Colors.dark.accent + '20', theme.bg]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
          <OpenCodeLogo />
          <Text style={[styles.title, { color: theme.text }]}>OPEN CODE</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>AI Coding Agent</Text>

          <View style={[styles.glassCard, { backgroundColor: Colors.dark.glassBg, borderColor: Colors.dark.glassBorder }]}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, mode === 'signin' && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={() => setMode('signin')}
              >
                <Text style={[styles.tabText, { color: mode === 'signin' ? '#fff' : 'rgba(255,255,255,0.5)' }]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.tabText, { color: mode === 'signup' ? '#fff' : 'rgba(255,255,255,0.5)' }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {mode === 'signup' && (
              <TextInput
                style={[styles.input, { color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }]}
                placeholder="Full name"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={name}
                onChangeText={setName}
              />
            )}
            <TextInput
              style={[styles.input, { color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }]}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }]}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { opacity: loading ? 0.6 : 1 }]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <Text style={[styles.dividerText, { color: 'rgba(255,255,255,0.4)' }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={loading}>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.terms, { color: 'rgba(255,255,255,0.3)' }]}>
            By continuing, you agree to our Terms of Service
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  inner: { alignItems: 'center', maxWidth: 400, width: '100%', alignSelf: 'center' },
  logoContainer: { marginBottom: Spacing.lg },
  logoBlock: { gap: 3 },
  logoRow: { flexDirection: 'row', gap: 3 },
  logoCell: { width: 16, height: 16, borderRadius: 2 },
  title: { fontSize: FontSize.title, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginTop: Spacing.xs, marginBottom: Spacing.xxxl },
  glassCard: {
    width: '100%',
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xxl,
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
  },
  tabRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: BorderRadius.md, padding: 4, marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.sm, alignItems: 'center' },
  tabText: { fontSize: FontSize.md, fontWeight: '600' },
  input: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    fontSize: FontSize.md,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg, gap: Spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.xs, fontWeight: '500' },
  googleBtn: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  googleBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  terms: { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18 },
});
