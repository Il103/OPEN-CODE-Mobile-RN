import { create } from 'zustand';
import { Colors, ThemeName } from '@/theme';
import { Message } from '@/services/api';

interface ChatMessage {
  id: string;
  text: string;
  type: 'user' | 'ai' | 'error';
  timestamp: number;
  image?: { uri: string; base64: string; mimeType: string };
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  userPhoto: string | null;
  setUser: (name: string, email: string, photo?: string | null) => void;
  logout: () => void;

  // Theme
  theme: ThemeName;
  colors: typeof Colors.dark;
  setTheme: (theme: ThemeName) => void;

  // Chat
  messages: ChatMessage[];
  isProcessing: boolean;
  currentModel: string;
  setModel: (model: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setProcessing: (processing: boolean) => void;
  clearMessages: () => void;

  // API Keys
  openaiKey: string;
  anthropicKey: string;
  geminiKey: string;
  setOpenAIKey: (key: string) => void;
  setAnthropicKey: (key: string) => void;
  setGeminiKey: (key: string) => void;

  // UI
  activeTab: 'chat' | 'models' | 'settings';
  setActiveTab: (tab: 'chat' | 'models' | 'settings') => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  isAuthenticated: false,
  userName: '',
  userEmail: '',
  userPhoto: null,
  setUser: (name, email, photo = null) =>
    set({ isAuthenticated: true, userName: name, userEmail: email, userPhoto: photo }),
  logout: () =>
    set({
      isAuthenticated: false,
      userName: '',
      userEmail: '',
      userPhoto: null,
      messages: [],
    }),

  // Theme
  theme: 'dark',
  colors: Colors.dark,
  setTheme: (theme) => set({ theme, colors: Colors[theme] }),

  // Chat
  messages: [],
  isProcessing: false,
  currentModel: 'gemini-2.0-flash',
  setModel: (model) => set({ currentModel: model }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setProcessing: (processing) => set({ isProcessing: processing }),
  clearMessages: () => set({ messages: [] }),

  // API Keys
  openaiKey: '',
  anthropicKey: '',
  geminiKey: '',
  setOpenAIKey: (key) => set({ openaiKey: key }),
  setAnthropicKey: (key) => set({ anthropicKey: key }),
  setGeminiKey: (key) => set({ geminiKey: key }),

  // UI
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
