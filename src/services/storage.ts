import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  OPENAI_KEY: '@opencode/openai_key',
  ANTHROPIC_KEY: '@opencode/anthropic_key',
  GEMINI_KEY: '@opencode/gemini_key',
  MODEL: '@opencode/model',
  THEME: '@opencode/theme',
  USER: '@opencode/user',
  CHAT_HISTORY: '@opencode/chat_history',
};

export const Storage = {
  async getOpenAIKey(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.OPENAI_KEY)) || '';
  },
  async setOpenAIKey(key: string) {
    await AsyncStorage.setItem(KEYS.OPENAI_KEY, key);
  },

  async getAnthropicKey(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.ANTHROPIC_KEY)) || '';
  },
  async setAnthropicKey(key: string) {
    await AsyncStorage.setItem(KEYS.ANTHROPIC_KEY, key);
  },

  async getGeminiKey(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.GEMINI_KEY)) || '';
  },
  async setGeminiKey(key: string) {
    await AsyncStorage.setItem(KEYS.GEMINI_KEY, key);
  },

  async getModel(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.MODEL)) || 'gemini-2.0-flash';
  },
  async setModel(model: string) {
    await AsyncStorage.setItem(KEYS.MODEL, model);
  },

  async getTheme(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.THEME)) || 'dark';
  },
  async setTheme(theme: string) {
    await AsyncStorage.setItem(KEYS.THEME, theme);
  },

  async getUser(): Promise<{ name: string; email: string } | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  async setUser(user: { name: string; email: string }) {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  async clearUser() {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async getChatHistory(): Promise<any[]> {
    const data = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  },
  async saveChatHistory(history: any[]) {
    await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(history));
  },
};
