import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface APIConfig {
  openaiKey: string;
  anthropicKey: string;
  geminiKey: string;
}

const config: APIConfig = {
  openaiKey: '',
  anthropicKey: '',
  geminiKey: '',
};

export function setAPIKeys(keys: Partial<APIConfig>) {
  Object.assign(config, keys);
}

export const APIService = {
  async sendMessage(
    model: string,
    messages: Message[],
    image?: { base64: string; mimeType: string },
  ): Promise<string> {
    const modelLower = model.toLowerCase();

    if (modelLower.includes('gpt')) {
      return callOpenAI(model, messages, image);
    }
    if (modelLower.includes('claude')) {
      return callAnthropic(model, messages, image);
    }
    if (modelLower.includes('gemini')) {
      return callGemini(model, messages, image);
    }
    throw new Error(`Unknown model: ${model}`);
  },
};

async function callOpenAI(
  model: string,
  messages: Message[],
  image?: { base64: string; mimeType: string },
): Promise<string> {
  if (!config.openaiKey) throw new Error('OpenAI API key required');

  const apiMessages: any[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (image && messages.length > 0) {
    const lastMsg = apiMessages[apiMessages.length - 1];
    lastMsg.content = [
      { type: 'text', text: lastMsg.content },
      {
        type: 'image_url',
        image_url: {
          url: `data:${image.mimeType};base64,${image.base64}`,
          detail: 'high',
        },
      },
    ];
  }

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, messages: apiMessages, max_tokens: 4096 },
    { headers: { Authorization: `Bearer ${config.openaiKey}`, 'Content-Type': 'application/json' } },
  );

  return res.data.choices[0].message.content;
}

async function callAnthropic(
  model: string,
  messages: Message[],
  image?: { base64: string; mimeType: string },
): Promise<string> {
  if (!config.anthropicKey) throw new Error('Anthropic API key required');

  const apiMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  if (image && apiMessages.length > 0) {
    const lastMsg = apiMessages[apiMessages.length - 1];
    lastMsg.content = [
      { type: 'text', text: lastMsg.content },
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mimeType,
          data: image.base64,
        },
      },
    ];
  }

  const res = await axios.post(
    'https://api.anthropic.com/v1/messages',
    { model, max_tokens: 4096, messages: apiMessages },
    {
      headers: {
        'x-api-key': config.anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    },
  );

  return res.data.content[0].text;
}

async function callGemini(
  model: string,
  messages: Message[],
  image?: { base64: string; mimeType: string },
): Promise<string> {
  if (!config.geminiKey) throw new Error('Gemini API key required');

  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg) throw new Error('No user message');

  const parts: any[] = [{ text: lastUserMsg.content }];

  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64,
      },
    });
  }

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiKey}`,
    { contents: [{ parts }], generationConfig: { maxOutputTokens: 4096 } },
    { headers: { 'Content-Type': 'application/json' } },
  );

  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

export const MODELS = {
  free: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', icon: '🧠', color: '#4285F4' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', icon: '⚡', color: '#10a37f' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', icon: '🌿', color: '#d97706' },
  ],
  premium: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '⭐', color: '#10a37f' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', icon: '🚀', color: '#10a37f' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🎯', color: '#d97706' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', icon: '👑', color: '#d97706' },
    { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', provider: 'Google', icon: '✨', color: '#4285F4' },
    { id: 'gemini-2.0-ultra', name: 'Gemini 2.0 Ultra', provider: 'Google', icon: '💎', color: '#4285F4' },
  ],
};
