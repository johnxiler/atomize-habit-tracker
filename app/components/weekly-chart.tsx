import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Props = {
    data: number[];
};

export function WeeklyChart({ data }: Props) {
    const colorScheme = useColorScheme() ?? 'dark';
    const maxHeight = 100;

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].surface }]}>
            <ThemedText style={styles.title}>This Week</ThemedText>
            <View style={styles.chart}>
                {data.map((value, index) => {
                    const height = Math.max(value * maxHeight, 4);
                    const isToday = index === data.length - 1;

                    return (
                        <View key={index} style={styles.barColumn}>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height,
                                            backgroundColor: isToday
                                                ? Colors.primary
                                                : (colorScheme === 'light' ? '#818cf8' : Colors.pastelOrchid),
                                            opacity: value > 0 ? 1 : 0.3,
                                        },
                                    ]}
                                />
                            </View>
                            <ThemedText style={[styles.dayLabel, isToday && { color: Colors.primary, fontWeight: '600' }]}>
                                {DAY_LABELS[index]}
                            </ThemedText>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
        borderRadius: Radius.lg,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 130,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
    },
    barContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
        alignItems: 'center',
    },
    bar: {
        width: 20,
        borderRadius: 10,
        minHeight: 4,
    },
    dayLabel: {
        fontSize: 11,
        opacity: 0.6,
        marginTop: Spacing.sm,
    },
});
