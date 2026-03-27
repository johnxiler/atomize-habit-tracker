import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useThemeContext, ThemeMode } from '@/context/theme-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const THEMES: ThemeMode[] = ['system', 'light', 'dark'];

export default function AppearanceScreen() {
    const { mode, setMode, activeTheme } = useThemeContext();
    const colorScheme = activeTheme;

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                {THEMES.map((theme, index) => (
                    <Pressable
                        key={theme}
                        onPress={() => setMode(theme)}
                        style={[styles.row, index < THEMES.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors[colorScheme].border }]}
                    >
                        <ThemedText style={styles.title}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</ThemedText>
                        {mode === theme && <MaterialIcons name="check" size={20} color={Colors.primary} />}
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Spacing.lg },
    card: { borderRadius: Radius.lg, overflow: 'hidden' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
    title: { fontSize: 16, fontWeight: '500' },
});
