import React, { useState, useEffect } from 'react';
import { View, Switch, StyleSheet, Alert, Platform } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerForPushNotificationsAsync, scheduleHabitReminder } from '@/services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function RemindersScreen() {
    const colorScheme = useColorScheme() ?? 'dark';
    const [isEnabled, setIsEnabled] = useState(false);
    const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        const saved = await AsyncStorage.getItem('notifications_enabled');
        setIsEnabled(saved === 'true');
    };

    const toggleSwitch = async () => {
        if (isExpoGoAndroid) {
            Alert.alert(
                "Environment Limitation",
                "Push notifications are not supported in Expo Go on Android (SDK 53+). Please use a development build for full functionality."
            );
            return;
        }

        const newValue = !isEnabled;
        if (newValue) {
            if (Platform.OS !== 'web') {
                await registerForPushNotificationsAsync();
                await scheduleHabitReminder("Stay Consistent!", 0);
                Alert.alert("Success", "Daily reminders have been scheduled for 9:00 AM.");
            }
        }
        setIsEnabled(newValue);
        await AsyncStorage.setItem('notifications_enabled', newValue.toString());
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            {isExpoGoAndroid && (
                <View style={[styles.infoBox, { backgroundColor: Colors[colorScheme].surface, borderColor: Colors.primary + '40' }]}>
                    <MaterialIcons name="info-outline" size={20} color={Colors.primary} />
                    <ThemedText style={styles.infoText}>
                        You are running in <ThemedText style={{ fontWeight: '700' }}>Expo Go</ThemedText>.
                        Push notifications require a development build on Android (SDK 53+).
                    </ThemedText>
                </View>
            )}

            <View style={[styles.card, { backgroundColor: Colors[colorScheme].surface }]}>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.title}>Daily Notifications</ThemedText>
                        <ThemedText style={styles.subtitle}>Remind me at 9:00 AM daily</ThemedText>
                    </View>
                    <Switch
                        trackColor={{ false: Colors[colorScheme].border, true: Colors.primary }}
                        thumbColor={'#fff'}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                        disabled={isExpoGoAndroid}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Spacing.lg },
    infoBox: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: Radius.md,
        marginBottom: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
    },
    infoText: {
        fontSize: 13,
        opacity: 0.8,
        flex: 1,
        lineHeight: 18,
    },
    card: { padding: Spacing.lg, borderRadius: Radius.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '600' },
    subtitle: { fontSize: 14, opacity: 0.6, marginTop: 4 },
});
