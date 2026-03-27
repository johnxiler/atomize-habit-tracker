import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProgressRing } from '@/components/progress-ring';
import { HabitCard } from '@/components/habit-card';
import { StatCard } from '@/components/stat-card';
import { useHabits } from '@/context/habit-context';
import { LevelProgressBar } from '@/components/level-progress';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const { habits, analytics, isLoading, toggleLog, getTodayLogs, xp, level, error, refreshData } = useHabits();

  if (isLoading && habits.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: Colors[colorScheme].background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error && habits.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: Colors[colorScheme].background, padding: Spacing.xl }]}>
        <MaterialIcons name="cloud-off" size={64} color={Colors.primary} style={{ marginBottom: Spacing.lg }} />
        <ThemedText style={styles.errorTitle}>Connection Error</ThemedText>
        <ThemedText style={styles.errorSubtitle}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <ThemedText style={styles.retryText}>Retry Connection</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const todayLogs = getTodayLogs();
  const completionRate = analytics?.completion_rate ?? 0;
  const completedCount = todayLogs.filter(l => l.completed).length;
  // totalStreaks approximation for the home stat
  const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 100 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <LevelProgressBar xp={xp} level={level} />

      <View style={styles.header}>
        <ThemedText style={styles.greeting}>{greeting()} 👋</ThemedText>
        <ThemedText style={styles.date}>{formatDate()}</ThemedText>
      </View>

      <View style={styles.progressSection}>
        <ProgressRing progress={completionRate} />
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Completed" value={`${completedCount}/${habits.length}`} color={Colors.primary} />
        <View style={{ width: Spacing.sm }} />
        <StatCard label="Total Streaks" value={totalStreaks} color={Colors.pastelOrchid} />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Today&apos;s Habits</ThemedText>
        {habits.length === 0 ? (
          <ThemedText style={{ opacity: 0.5 }}>No habits created yet. Tap + to add one!</ThemedText>
        ) : (
          habits.map(habit => {
            const isCompleted = todayLogs.some(l => l.habit_id === habit.id && l.completed);
            return (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                streak={habit.streak}
                color={habit.color}
                difficulty={habit.difficulty}
                category={habit.category}
                habitScore={habit.habit_score}
                xpValue={habit.xp_value}
                completed={isCompleted}
                onToggle={() => toggleLog(habit.id, new Date().toISOString().split('T')[0])}
              />
            );
          })
        )}
      </View>
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
  },
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});
