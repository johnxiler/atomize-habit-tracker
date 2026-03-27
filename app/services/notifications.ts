import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Helper to get notifications only if supported
const getNotifications = () => {
    if (Platform.OS === 'web') return null;

    // EXTREME ISOLATION: Return a mock object for Android Expo Go to prevent library eval
    if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
        return {
            setNotificationHandler: () => { },
            getPermissionsAsync: async () => ({ status: 'granted' }),
            requestPermissionsAsync: async () => ({ status: 'granted' }),
            scheduleNotificationAsync: async () => "stub-id",
            SchedulableTriggerInputTypes: { CALENDAR: 'calendar' }
        };
    }

    try {
        const Notifications = require('expo-notifications');
        return Notifications;
    } catch {
        return null;
    }
};

export async function registerForPushNotificationsAsync() {
    const Notifications = getNotifications();
    if (!Notifications) return;

    // Initialize handler if it hasn't been done
    try {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    } catch (e) {
        console.warn('Silent skip: Handler registration failed');
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }
    } catch (error) {
        console.error('Error during notification registration:', error);
    }
}

export async function scheduleHabitReminder(title: string, habitId: number) {
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Habit Reminder",
                body: `Don't forget to complete your habit: ${title}`,
                data: { habitId },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: 9,
                minute: 0,
                repeats: true,
            },
        });
    } catch (error) {
        console.error('Error scheduling notification:', error);
    }
}
