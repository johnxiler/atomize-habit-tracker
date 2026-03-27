import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHabits } from '@/context/habit-context';
import { HabitCard } from '@/components/habit-card';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const { habits, isLoading, getTodayLogs, toggleLog, deleteHabit } = useHabits();

  if (isLoading && habits.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: Colors[colorScheme].background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const screenTodayLogs = getTodayLogs();

  const handleDelete = (id: number, title: string) => {
    const performDelete = async () => {
      await deleteHabit(id);
    };

    if (Platform.OS === 'web') {
      if (confirm(`Are you sure you want to delete "${title}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Habit',
        `Are you sure you want to delete "${title}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title}>Manage Habits</ThemedText>
        <ThemedText style={styles.subtitle}>{habits.length} habits tracked</ThemedText>

        {habits.length === 0 ? (
          <ThemedText style={{ opacity: 0.5 }}>You haven&apos;t tracked any habits yet.</ThemedText>
        ) : (
          habits.map(habit => {
            const isCompleted = screenTodayLogs.some(l => l.habit_id === habit.id && l.completed);
            return (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                streak={habit.streak}
                color={habit.color}
                completed={isCompleted}
                difficulty={habit.difficulty}
                category={habit.category}
                habitScore={habit.habit_score}
                xpValue={habit.xp_value}
                onToggle={() => toggleLog(habit.id, new Date().toISOString().split('T')[0])}
                onDelete={() => handleDelete(habit.id, habit.title)}
                showEdit={true}
                hideToggle={true}
              />
            );
          })
        )}
      </ScrollView>

      <View
        style={[
          styles.fabContainer,
          {
            bottom: insets.bottom + 100,
            backgroundColor: Colors[colorScheme].tint,
          },
          colorScheme === 'light' && { borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' }
        ]}
      >
        <Link href="/modal" asChild>
          <Pressable
            style={styles.fabPressable}
            android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
          >
            <MaterialIcons name="add" size={36} color="#fff" />
          </Pressable>
        </Link>
      </View>
    </View>
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
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    opacity: 0.6,
  },
  metaDot: {
    fontSize: 12,
    opacity: 0.3,
  },
  fabContainer: {
    position: 'absolute',
    right: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 999,
    overflow: Platform.OS === 'android' ? 'visible' : 'visible', // Ensure shadow is seen
  },
  fabPressable: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
