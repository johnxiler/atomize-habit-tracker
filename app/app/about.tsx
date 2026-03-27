import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AboutScreen() {
    const colorScheme = useColorScheme() ?? 'dark';

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <View style={styles.center}>
                <View style={[styles.logo, { backgroundColor: Colors.primary }]}>
                    <ThemedText style={styles.logoText}>A</ThemedText>
                </View>
                <ThemedText style={styles.appName}>Atomize Habit Tracker</ThemedText>
                <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                <ThemedText style={styles.text}>Developed by Rewlixdev</ThemedText>
                <ThemedText style={[styles.text, { marginTop: Spacing.sm }]}>Built with Expo, React Native, Rust, and SQLx. Analytics powered by native raw inline Assembly!</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Spacing.lg },
    center: { alignItems: 'center', marginVertical: Spacing.xl },
    logo: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
    logoText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    appName: { fontSize: 22, fontWeight: '700' },
    version: { fontSize: 14, opacity: 0.5, marginTop: 4 },
    card: { padding: Spacing.lg, borderRadius: Radius.lg },
    text: { fontSize: 15 },
});
