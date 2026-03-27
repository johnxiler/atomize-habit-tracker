import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useHabits } from '@/context/habit-context';

export default function BackupScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const { refreshData } = useHabits();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await refreshData();
            setLastSync(new Date().toLocaleString());
        } catch (e) {
            console.error(e);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="cloud-sync" size={48} color={Colors.primary} />
                </View>
                <ThemedText style={styles.title}>Cloud Sync</ThemedText>
                <ThemedText style={styles.subtitle}>
                    {lastSync ? `Last synced: ${lastSync}` : 'Your habits are securely backed up.'}
                </ThemedText>

                <Pressable
                    style={[styles.button, isSyncing && { opacity: 0.7 }]}
                    onPress={handleSync}
                    disabled={isSyncing}
                >
                    {isSyncing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Sync Now</ThemedText>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Spacing.lg },
    card: { padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center' },
    iconContainer: { marginBottom: Spacing.lg },
    title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
    subtitle: { fontSize: 14, opacity: 0.6, marginBottom: Spacing.xl, textAlign: 'center' },
    button: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.md, width: '100%', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
