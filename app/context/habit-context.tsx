import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';
import { api, HabitResponse, AnalyticsResponse, CreateHabitRequest, AIAnalysisResponse } from '@/services/api';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusToast } from '@/components/status-toast';

interface HabitContextType {
  habits: HabitResponse[];
  analytics: AnalyticsResponse | null;
  isLoading: boolean;
  xp: number;
  level: number;
  addHabit: (habit: CreateHabitRequest) => Promise<void>;
  updateHabit: (id: number, habit: Partial<CreateHabitRequest>) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  toggleLog: (habitId: number, date: string) => Promise<void>;
  getTodayLogs: () => { habit_id: number, date: string, completed: boolean }[];
  refreshData: () => Promise<void>;
  aiAnalysis: AIAnalysisResponse | null;
  error: string | null;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [logsState, setLogsState] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const xp = useMemo(() => {
    // Basic logic: if completed_today is true, add its xp_value
    // In a real app, this would come from a comprehensive logs summary from backend
    return habits.reduce((sum, h) => {
      const isCompleted = logsState[`${h.id}-${new Date().toISOString().split('T')[0]}`] ?? h.completed_today;
      return sum + (isCompleted ? h.xp_value : 0);
    }, 0);
  }, [habits, logsState]);

  const level = useMemo(() => Math.floor(xp / 100) + 1, [xp]);
  const [error, setError] = useState<string | null>(null);

  // Load cache on mount
  React.useEffect(() => {
    const loadCache = async () => {
      try {
        const [cachedHabits, cachedAnalytics, cachedAI] = await Promise.all([
          AsyncStorage.getItem('cache_habits'),
          AsyncStorage.getItem('cache_analytics'),
          AsyncStorage.getItem('cache_ai_analysis'),
        ]);
        if (cachedHabits) setHabits(JSON.parse(cachedHabits));
        if (cachedAnalytics) setAnalytics(JSON.parse(cachedAnalytics));
        if (cachedAI) setAiAnalysis(JSON.parse(cachedAI));
      } catch (e) {
        console.warn('Failed to load cache:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCache();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [habitsData, analyticsData, aiData] = await Promise.all([
        api.getHabits(),
        api.getAnalytics(),
        api.getAIAnalysis(),
      ]);
      setHabits(habitsData);
      setAnalytics(analyticsData);
      setAiAnalysis(aiData);

      // Update cache
      AsyncStorage.setItem('cache_habits', JSON.stringify(habitsData));
      AsyncStorage.setItem('cache_analytics', JSON.stringify(analyticsData));
      AsyncStorage.setItem('cache_ai_analysis', JSON.stringify(aiData));
    } catch (err) {
      console.error('Failed to load data:', err);
      // Only set error if we don't have habits yet (initial load failure)
      if (habits.length === 0) {
        setError('Could not connect to server');
      }
    } finally {
      setIsLoading(false);
    }
  }, [habits.length]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getTodayLogs = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return habits.map(habit => {
      const key = `${habit.id}-${todayStr}`;
      const completed = logsState[key] ?? habit.completed_today;
      return { habit_id: habit.id, date: todayStr, completed };
    });
  };

  const addHabit = async (request: CreateHabitRequest) => {
    try {
      const newHabit = await api.createHabit(request);
      setHabits(prev => [newHabit, ...prev]);
      await loadData(); // Ensure cache is updated
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  };

  const updateHabit = async (id: number, request: Partial<CreateHabitRequest>) => {
    try {
      await api.updateHabit(id, request);
      await loadData();
    } catch (err) {
      console.error('Failed to update habit:', err);
    }
  };

  const deleteHabit = async (id: number) => {
    const originalHabits = [...habits];
    // Optimistic Update
    setHabits(prev => prev.filter(h => h.id !== id));

    try {
      await api.deleteHabit(id);
      // Update cache
      const updatedHabits = originalHabits.filter(h => h.id !== id);
      await AsyncStorage.setItem('cache_habits', JSON.stringify(updatedHabits));
      await loadData(); // Full refresh for analytics/XP
    } catch (err) {
      console.error('Failed to delete habit:', err);
      // Revert if failed
      setHabits(originalHabits);
      setError('Failed to delete habit. Please try again.');
    }
  };

  const toggleLog = async (habitId: number, date: string) => {
    const key = `${habitId}-${date}`;
    // Optimistic update
    setLogsState(prev => ({ ...prev, [key]: !(prev[key] || false) }));
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    try {
      const res = await api.toggleLog(habitId, date);
      setLogsState(prev => ({ ...prev, [key]: res.completed }));
      if (res.completed) {
        setToast({ visible: true, message: 'Habit completed! +10 XP' });
      }
      // Reload to update streaks in background
      loadData();
    } catch (err) {
      console.error('Failed to toggle log:', err);
      // Revert optimistic update
      setLogsState(prev => ({ ...prev, [key]: !(prev[key] || false) }));
    }
  };

  const value: HabitContextType = {
    habits,
    analytics,
    isLoading,
    xp,
    level,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleLog,
    getTodayLogs,
    refreshData: loadData,
    aiAnalysis,
    error,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
      <StatusToast
        visible={toast.visible}
        message={toast.message}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within HabitProvider');
  return context;
}
