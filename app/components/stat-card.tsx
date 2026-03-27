import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
    label: string;
    value: string | number;
    icon?: string;
    color?: string;
};

export function StatCard({ label, value, color }: Props) {
    const colorScheme = useColorScheme() ?? 'dark';

    return (
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
            <ThemedText style={[styles.value, { color: colorScheme === 'light' ? Colors.primary : (color || Colors.primary) }]}>
                {value}
            </ThemedText>
            <ThemedText style={styles.label}>{label}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        alignItems: 'center',
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
    },
    label: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
});
