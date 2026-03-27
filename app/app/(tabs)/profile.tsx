import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHabits } from '@/context/habit-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const { habits, analytics, isLoading } = useHabits();

  if (isLoading && !analytics) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: Colors[colorScheme].background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const totalHabits = analytics?.total_habits ?? 0;
  const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
  const bestStreak = habits.reduce((best, h) => Math.max(best, h.best_streak), 0);

  const settingsItems = [
    { icon: 'notifications-none' as const, label: 'Reminders', route: '/reminders' },
    { icon: 'palette' as const, label: 'Appearance', route: '/appearance' },
    { icon: 'backup' as const, label: 'Backup & Sync', route: '/backup' },
    { icon: 'info-outline' as const, label: 'About', route: '/about' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: Colors.pastelLavender }]}>
          <ThemedText style={styles.avatarText}>A</ThemedText>
        </View>
        <ThemedText style={styles.name}>Atomizer</ThemedText>
        <ThemedText style={styles.joined}>Member since March 2026</ThemedText>
      </View>

      <Pressable onPress={() => Alert.alert('Coming Soon', 'Premium features are currently under development. Stay tuned!')}>
        <View style={[styles.premiumCard]}>
          <View style={styles.premiumContent}>
            <ThemedText style={styles.premiumTitle}>⚡ Go Premium</ThemedText>
            <ThemedText style={styles.premiumDesc}>Unlimited habits, advanced analytics</ThemedText>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#fff" />
        </View>
      </Pressable>

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: Colors[colorScheme].surface }]}>
          <ThemedText style={[styles.statValue, { color: Colors.primary }]}>{totalHabits}</ThemedText>
          <ThemedText style={styles.statLabel}>Habits</ThemedText>
        </View>
        <View style={[styles.statBox, { backgroundColor: Colors[colorScheme].surface }]}>
          <ThemedText style={[styles.statValue, { color: Colors.pastelOrchid }]}>{totalStreaks}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Streaks</ThemedText>
        </View>
        <View style={[styles.statBox, { backgroundColor: Colors[colorScheme].surface }]}>
          <ThemedText style={[styles.statValue, { color: Colors.pastelBlue }]}>{bestStreak}</ThemedText>
          <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
        </View>
      </View>

      <View style={[styles.settingsSection, { backgroundColor: Colors[colorScheme].surface }]}>
        {settingsItems.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={[styles.settingsRow, index < settingsItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors[colorScheme].border }]}
          >
            <MaterialIcons name={item.icon} size={22} color={Colors[colorScheme].icon} />
            <ThemedText style={styles.settingsLabel}>{item.label}</ThemedText>
            <MaterialIcons name="chevron-right" size={20} color={Colors[colorScheme].icon} />
          </Pressable>
        ))}
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
    paddingTop: 60,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  joined: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 4,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  premiumDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
  },
  settingsSection: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
  },
});
