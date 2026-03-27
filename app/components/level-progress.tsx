import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LevelProgressBarProps {
    xp: number;
    level: number;
}

export function LevelProgressBar({ xp, level }: LevelProgressBarProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const progress = (xp % 100) / 100;

    const levelNames = [
        'Beginner',
        'Consistent',
        'Discipline Master',
        'Habit Warrior',
        'Elite Zen',
    ];

    const levelName = levelNames[Math.min(Math.floor((level - 1) / 5), levelNames.length - 1)];

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].surface }]}>
            <View style={styles.header}>
                <View>
                    <ThemedText style={styles.levelLabel}>Level {level}</ThemedText>
                    <ThemedText style={styles.levelName}>{levelName}</ThemedText>
                </View>
                <ThemedText style={styles.xpText}>{xp % 100}/100 XP</ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: Colors[colorScheme].border }]}>
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${progress * 100}%`,
                            backgroundColor: Colors.primary
                        }
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
        borderRadius: Radius.lg,
        marginBottom: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: Spacing.sm,
    },
    levelLabel: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    levelName: {
        fontSize: 18,
        fontWeight: '700',
    },
    xpText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    track: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
});
