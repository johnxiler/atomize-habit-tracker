import { Platform } from 'react-native';
import Constants from 'expo-constants';

// REPLACE THIS with your Render URL after deployment (e.g., https://atomize-backend.onrender.com)
const PRODUCTION_URL = '';

const getApiBase = () => {
  if (PRODUCTION_URL) return PRODUCTION_URL;
  if (Platform.OS === 'web') return 'http://localhost:3000';

  // Try to get the host from Expo's manifest for physical devices/Expo Go
  const debuggerHost = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  const host = debuggerHost?.split(':').shift();

  if (host) {
    return `http://${host}:3000`;
  }

  // Fallback for emulators
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

const API_BASE = getApiBase();

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(endpoint: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s for stability

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorMsg = `API Error: ${res.status}`;
      throw new Error(errorMsg);
    }
    if (res.status === 204) {
      return {} as T;
    }

    const text = await res.text();
    const trimmed = text.trim();
    return trimmed ? JSON.parse(trimmed) : ({} as T);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Connection timed out at ${API_BASE}. Please ensure the backend is running and your device is on the same Wi-Fi.`);
    }
    console.error(`Network Error at ${API_BASE}: ${err}`);
    throw err;
  }
}

export type HabitResponse = {
  id: number;
  title: string;
  color: string;
  frequency: string;
  difficulty: number;
  category: string;
  xp_value: number;
  habit_score: number;
  created_at: string;
  streak: number;
  best_streak: number;
  completed_today: boolean;
};

export type CreateHabitRequest = {
  title: string;
  color?: string;
  frequency?: string;
  difficulty?: number;
  category?: string;
};

export type HabitLogResponse = {
  habit_id: number;
  date: string;
  completed: boolean;
};

export type AIAnalysisResponse = {
  insights: string[];
  predictions: string[];
};

export type AnalyticsResponse = {
  habit_score: number;
  weekly_rates: number[];
  completion_dates: string[];
  total_habits: number;
  avg_streak: number;
  completion_rate: number;
};

export type Reflection = {
  id: number;
  habit_id: number;
  date: string;
  content: string;
};

export const api = {
  getHabits: () => request<HabitResponse[]>('/habits'),
  createHabit: (data: CreateHabitRequest) =>
    request<HabitResponse>('/habits', 'POST', data),
  updateHabit: (id: number, data: Partial<CreateHabitRequest>) =>
    request<HabitResponse>(`/habits/${id}`, 'PUT', data),
  deleteHabit: (id: number) => request<void>(`/habits/${id}`, 'DELETE'),
  toggleLog: (habitId: number, date: string) =>
    request<HabitLogResponse>('/logs', 'POST', { habit_id: habitId, date }),
  getAnalytics: () => request<AnalyticsResponse>('/analytics'),
  getAIAnalysis: () => request<AIAnalysisResponse>('/ai-analysis'),
  getReflections: (habitId: number) => request<Reflection[]>(`/reflections/${habitId}`),
  createReflection: (data: { habit_id: number; date: string; content: string }) =>
    request<Reflection>('/reflections', 'POST', data),
};