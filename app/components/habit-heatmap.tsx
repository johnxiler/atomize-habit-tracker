import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';

interface HabitHeatmapProps {
    logs: { date: string; completed: boolean }[];
}

export function HabitHeatmap({ logs }: HabitHeatmapProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const numWeeks = 13;
    const squareSize = 12;
    const gap = 3;
    const width = (squareSize + gap) * numWeeks;
    const height = (squareSize + gap) * 7;

    const today = new Date();
    const data = [];

    for (let w = 0; w < numWeeks; w++) {
        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() - ((numWeeks - 1 - w) * 7 + (6 - d)));
            const dateStr = date.toISOString().split('T')[0];
            const completed = logs.some(l => l.date === dateStr && l.completed);

            data.push({
                x: w * (squareSize + gap),
                y: d * (squareSize + gap),
                completed,
            });
        }
    }

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Yearly Consistency</ThemedText>
            <View style={styles.heatmapWrapper}>
                <Svg width={width} height={height}>
                    {data.map((item, i) => (
                        <Rect
                            key={i}
                            x={item.x}
                            y={item.y}
                            width={squareSize}
                            height={squareSize}
                            rx={2}
                            fill={item.completed
                                ? Colors.primary
                                : (colorScheme === 'light' ? '#e2e8f0' : Colors[colorScheme].border)}
                            opacity={item.completed ? 1 : (colorScheme === 'light' ? 0.6 : 0.3)}
                        />
                    ))}
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
        marginTop: Spacing.md,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        opacity: 0.7,
    },
    heatmapWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
