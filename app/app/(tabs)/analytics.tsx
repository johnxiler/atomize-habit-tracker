import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatCard } from '@/components/stat-card';
import { WeeklyChart } from '@/components/weekly-chart';
import { useHabits } from '@/context/habit-context';
import { HabitHeatmap } from '@/components/habit-heatmap';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const { habits, analytics, aiAnalysis, isLoading } = useHabits();

  if (isLoading && !analytics) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: Colors[colorScheme].background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const habitScore = analytics?.habit_score ?? 0;
  const avgStreak = analytics?.avg_streak ? Math.round(analytics.avg_streak) : 0;
  const completionRate = analytics?.completion_rate ?? 0;
  const weeklyData = analytics?.weekly_rates ?? [0, 0, 0, 0, 0, 0, 0];
  const totalHabits = analytics?.total_habits ?? 0;

  const bestHabit = habits.reduce((best, h) => (h.streak > (best?.streak ?? 0) ? h : best), habits[0]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText style={styles.title}>Analytics</ThemedText>
      <ThemedText style={styles.subtitle}>Your habit insights</ThemedText>

      <View style={[styles.scoreCard, { backgroundColor: Colors[colorScheme].surface }]}>
        <ThemedText style={styles.scoreLabel}>Habit Score</ThemedText>
        <ThemedText style={[styles.scoreValue, { color: Colors.primary }]}>{habitScore}</ThemedText>
        <ThemedText style={styles.scoreMax}>/100</ThemedText>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Avg Streak" value={`${avgStreak}d`} color={Colors.pastelOrchid} />
        <View style={{ width: Spacing.sm }} />
        <StatCard label="Total Habits" value={totalHabits} color={Colors.pastelBlue} />
        <View style={{ width: Spacing.sm }} />
        <StatCard label="Today" value={`${Math.round(completionRate * 100)}%`} color={Colors.primary} />
      </View>

      <WeeklyChart data={weeklyData} />

      {analytics?.completion_dates && (
        <HabitHeatmap logs={analytics.completion_dates.map(date => ({ date, completed: true }))} />
      )}

      <View style={styles.aiSection}>
        <View style={styles.aiHeader}>
          <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
          <ThemedText style={styles.aiTitle}>AI Habit Coach</ThemedText>
        </View>

        {aiAnalysis?.insights.map((insight, i) => (
          <View key={`insight-${i}`} style={[styles.aiCard, { backgroundColor: Colors[colorScheme].surface }]}>
            <MaterialIcons name="lightbulb" size={16} color="#ffa500" />
            <ThemedText style={styles.aiText}>{insight}</ThemedText>
          </View>
        ))}

        {aiAnalysis?.predictions.map((pred, i) => (
          <View key={`pred-${i}`} style={[styles.aiCard, { backgroundColor: Colors[colorScheme].surface, borderLeftColor: '#ff4d4d', borderLeftWidth: 4 }]}>
            <MaterialIcons name="trending-up" size={16} color="#ff4d4d" />
            <ThemedText style={styles.aiText}>{pred}</ThemedText>
          </View>
        ))}
      </View>

      {bestHabit && bestHabit.streak > 0 && (
        <View style={[styles.bestHabitCard, { backgroundColor: Colors[colorScheme].surface }]}>
          <ThemedText style={styles.bestLabel}>🏆 Best Habit</ThemedText>
          <ThemedText style={styles.bestTitle}>{bestHabit.title}</ThemedText>
          <ThemedText style={styles.bestStreak}>{bestHabit.streak} day streak</ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 18,
    opacity: 0.4,
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  bestHabitCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  bestLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  bestTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  bestStreak: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
  },
  aiSection: {
    marginTop: Spacing.xl,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: 12,
  },
  aiText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
