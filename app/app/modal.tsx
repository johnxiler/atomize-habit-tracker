import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHabits } from '@/context/habit-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const HABIT_COLORS = [
  Colors.pastelBlue,
  Colors.pastelPink,
  Colors.pastelLavender,
  Colors.pastelOrchid,
];

const FREQUENCIES = ['daily', 'weekly'] as const;

export default function HabitModal() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const isEditing = !!habitId;
  const colorScheme = useColorScheme() ?? 'dark';
  const { addHabit, updateHabit, deleteHabit, habits } = useHabits();

  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [difficulty, setDifficulty] = useState<number>(1);
  const [isSpiritual, setIsSpiritual] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const habit = habits.find(h => h.id === Number(habitId));
      if (habit) {
        setTitle(habit.title);
        setSelectedColor(habit.color);
        setFrequency(habit.frequency as 'daily' | 'weekly');
        setDifficulty(habit.difficulty);
        setIsSpiritual(habit.category === 'spiritual');
      }
    }
  }, [habitId, isEditing, habits]);

  const handleSave = async () => {
    if (!title.trim()) return;

    const data = {
      title: title.trim(),
      color: selectedColor,
      frequency,
      difficulty,
      category: isSpiritual ? 'spiritual' : 'general',
    };

    if (isEditing) {
      await updateHabit(Number(habitId), data);
    } else {
      await addHabit(data);
    }
    router.back();
  };

  const handleDelete = () => {
    const performDelete = async () => {
      await deleteHabit(Number(habitId));
      router.back();
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this habit?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Habit',
        'Are you sure you want to delete this habit? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={styles.content}
    >
      <ThemedText style={styles.label}>Habit Name</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[colorScheme].surface,
            color: Colors[colorScheme].text,
            borderColor: Colors[colorScheme].border,
          },
        ]}
        placeholder="e.g. Read 20 pages"
        placeholderTextColor={Colors[colorScheme].textSecondary}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <ThemedText style={styles.label}>Color</ThemedText>
      <View style={styles.colorRow}>
        {HABIT_COLORS.map(color => (
          <Pressable
            key={color}
            onPress={() => setSelectedColor(color)}
            style={[
              styles.colorDot,
              {
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: Colors.primary,
              },
            ]}
          />
        ))}
      </View>

      <ThemedText style={styles.label}>Difficulty</ThemedText>
      <View style={styles.freqRow}>
        {[
          { label: 'Easy', val: 1 },
          { label: 'Med', val: 2 },
          { label: 'Hard', val: 3 },
        ].map(diff => (
          <Pressable
            key={diff.val}
            onPress={() => setDifficulty(diff.val)}
            style={[
              styles.freqButton,
              {
                backgroundColor: difficulty === diff.val ? Colors.primary : Colors[colorScheme].surface,
                borderColor: difficulty === diff.val ? Colors.primary : Colors[colorScheme].border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.freqText,
                { color: difficulty === diff.val ? '#fff' : Colors[colorScheme].text },
              ]}
            >
              {diff.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.label}>Premium Features</ThemedText>
      <Pressable
        onPress={() => setIsSpiritual(!isSpiritual)}
        style={[
          styles.freqButton,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: isSpiritual ? '#6200EE' : Colors[colorScheme].surface,
            borderColor: isSpiritual ? '#6200EE' : Colors[colorScheme].border,
          },
        ]}
      >
        <ThemedText style={{ color: isSpiritual ? '#fff' : Colors[colorScheme].text, fontWeight: '600' }}>
          Spiritual Mode (Bible, Prayer)
        </ThemedText>
        {isSpiritual && <ThemedText style={{ color: '#fff' }}>✨</ThemedText>}
      </Pressable>

      <ThemedText style={styles.label}>Frequency</ThemedText>
      <View style={styles.freqRow}>
        {FREQUENCIES.map(freq => (
          <Pressable
            key={freq}
            onPress={() => setFrequency(freq)}
            style={[
              styles.freqButton,
              {
                backgroundColor: frequency === freq ? Colors.primary : Colors[colorScheme].surface,
                borderColor: frequency === freq ? Colors.primary : Colors[colorScheme].border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.freqText,
                { color: frequency === freq ? '#fff' : Colors[colorScheme].text },
              ]}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleSave}
        style={[styles.createButton, !title.trim() && { opacity: 0.5 }]}
        disabled={!title.trim()}
      >
        <ThemedText style={styles.createText}>
          {isEditing ? 'Save Changes' : 'Create Habit'}
        </ThemedText>
      </Pressable>

      {isEditing && (
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <ThemedText style={styles.deleteText}>Delete Habit</ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  freqButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  freqText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  createText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  deleteText: {
    color: '#ff4d4d',
    fontSize: 14,
    fontWeight: '600',
  },
});
