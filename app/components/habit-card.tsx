import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Modal, TextInput, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { api } from '@/services/api';
import { getVerseForTitle } from '@/constants/verses';
import { router } from 'expo-router';

type Props = {
    id: number;
    title: string;
    streak: number;
    color: string;
    completed: boolean;
    difficulty: number;
    category: string;
    habitScore: number;
    xpValue: number;
    onToggle: () => void;
    onDelete?: () => void;
    showEdit?: boolean;
    hideToggle?: boolean;
};

export function HabitCard({ id, title, streak, color, completed, difficulty, category, habitScore, xpValue, onToggle, onDelete, showEdit = false, hideToggle = false }: Props) {
    const colorScheme = useColorScheme() ?? 'dark';
    const scale = useSharedValue(1);
    const [showReflect, setShowReflect] = useState(false);
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [contextualVerse, setContextualVerse] = useState({ text: '', ref: '' });

    // Update verse when modal opens or title changes
    useEffect(() => {
        if (showReflect) {
            setContextualVerse(getVerseForTitle(title));
        }
    }, [showReflect, title]);

    const handleEdit = () => {
        router.push({ pathname: '/modal', params: { habitId: id } });
    };

    const handleSaveReflection = async () => {
        if (!content.trim()) return;
        setIsSaving(true);
        try {
            await api.createReflection({
                habit_id: id,
                date: new Date().toISOString().split('T')[0],
                content: content.trim(),
            });
            setShowReflect(false);
            setContent('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        scale.value = withSpring(0.95, {}, () => {
            scale.value = withSpring(1);
        });
        onToggle();
    };

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={handlePress}
                style={[
                    styles.card,
                    {
                        backgroundColor: Colors[colorScheme].surface,
                        borderColor: completed ? Colors.primary : Colors[colorScheme].border,
                        borderWidth: completed ? 1.5 : 1,
                    },
                ]}
            >
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <ThemedText
                            style={[styles.title, completed && styles.completedTitle]}
                            numberOfLines={2}
                        >
                            {title}
                        </ThemedText>
                    </View>

                    <View style={styles.badgeRow}>
                        <View style={[styles.difficultyBadge, { backgroundColor: difficulty === 3 ? '#ff4d4d' : difficulty === 2 ? '#ffa500' : '#4CAF50' }]}>
                            <ThemedText style={styles.difficultyText}>
                                {difficulty === 3 ? 'Hard' : difficulty === 2 ? 'Med' : 'Easy'}
                            </ThemedText>
                        </View>
                        {xpValue > 0 && category === 'spiritual' && (
                            <View style={[styles.difficultyBadge, { backgroundColor: '#6200EE', marginLeft: 4 }]}>
                                <ThemedText style={styles.difficultyText}>Spiritual</ThemedText>
                            </View>
                        )}
                    </View>

                    <View style={styles.streakRow}>
                        <View style={styles.metaItem}>
                            <MaterialIcons name="local-fire-department" size={16} color={Colors.primary} />
                            <ThemedText style={styles.streakText}>{streak}d</ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialIcons name="star" size={16} color="#FFD700" />
                            <ThemedText style={styles.streakText}>{habitScore}</ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <ThemedText style={[styles.xpText, { color: Colors.primary }]}>+{xpValue}xp</ThemedText>
                        </View>
                    </View>
                </View>
                <View style={styles.actionRow}>
                    {showEdit && (
                        <>
                            <Pressable onPress={handleEdit} style={styles.reflectBtn}>
                                <MaterialIcons name="edit" size={20} color={Colors[colorScheme].textSecondary} />
                            </Pressable>
                            {onDelete && (
                                <Pressable onPress={onDelete} style={styles.reflectBtn}>
                                    <MaterialIcons name="delete-outline" size={20} color="#ff4d4d" />
                                </Pressable>
                            )}
                        </>
                    )}
                    {category === 'spiritual' && (
                        <Pressable onPress={() => setShowReflect(true)} style={styles.reflectBtn}>
                            <MaterialIcons name="edit-note" size={24} color={Colors.primary} />
                        </Pressable>
                    )}
                    {!hideToggle && (
                        <View
                            style={[
                                styles.checkbox,
                                {
                                    backgroundColor: completed ? Colors.primary : 'transparent',
                                    borderColor: completed ? Colors.primary : Colors[colorScheme].border,
                                },
                            ]}
                        >
                            {completed && <MaterialIcons name="check" size={16} color="#fff" />}
                        </View>
                    )}
                </View>

                <Modal visible={showReflect} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme].surface }]}>
                            <ThemedText style={styles.modalTitle}>Spiritual Reflection</ThemedText>
                            <ThemedText style={styles.modalSubtitle}>How did &quot;{title}&quot; impact your soul today?</ThemedText>

                            {category === 'spiritual' && contextualVerse.text && (
                                <View style={[styles.verseCard, { backgroundColor: Colors[colorScheme].background }]}>
                                    <ThemedText style={styles.verseText}>&quot;{contextualVerse.text}&quot;</ThemedText>
                                    <ThemedText style={styles.verseRef}>— {contextualVerse.ref}</ThemedText>
                                </View>
                            )}

                            <TextInput
                                style={[styles.reflectInput, { color: Colors[colorScheme].text, borderColor: Colors[colorScheme].border }]}
                                multiline
                                placeholder="I felt peaceful today..."
                                placeholderTextColor={Colors[colorScheme].textSecondary}
                                value={content}
                                onChangeText={setContent}
                            />

                            <View style={styles.modalActions}>
                                <Pressable onPress={() => setShowReflect(false)} style={styles.cancelBtn}>
                                    <ThemedText>Cancel</ThemedText>
                                </Pressable>
                                <Pressable
                                    onPress={handleSaveReflection}
                                    style={[styles.saveBtn, (!content.trim() || isSaving) && { opacity: 0.5 }]}
                                    disabled={!content.trim() || isSaving}
                                >
                                    <ThemedText style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Verse/Note'}</ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
        // Elevation for Android
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    completedTitle: {
        opacity: 0.5,
        textDecorationLine: 'line-through',
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    difficultyBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    difficultyText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    verseCard: {
        padding: Spacing.md,
        borderRadius: Radius.md,
        marginBottom: Spacing.md,
        fontStyle: 'italic',
    },
    verseText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        opacity: 0.8,
    },
    verseRef: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 4,
        opacity: 0.6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    xpText: {
        fontSize: 10,
        fontWeight: '700',
    },
    streakText: {
        fontSize: 12,
        opacity: 0.6,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reflectBtn: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        padding: Spacing.xl,
        height: '70%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        opacity: 0.6,
        marginBottom: Spacing.lg,
    },
    reflectInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: Radius.md,
        padding: Spacing.md,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: Spacing.lg,
    },
    cancelBtn: {
        padding: Spacing.md,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
});
