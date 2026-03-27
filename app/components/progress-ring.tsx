import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
    progress: number;
    size?: number;
    strokeWidth?: number;
};

export function ProgressRing({ progress, size = 140, strokeWidth = 10 }: Props) {
    const colorScheme = useColorScheme() ?? 'dark';
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.min(progress, 1));
    const percentage = Math.round(progress * 100);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={Colors[colorScheme].border}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={Colors.primary}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <View style={styles.label}>
                <ThemedText style={styles.percentage}>{percentage}%</ThemedText>
                <ThemedText style={styles.subtext}>completed</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        position: 'absolute',
        alignItems: 'center',
    },
    percentage: {
        fontSize: 28,
        fontWeight: '700',
    },
    subtext: {
        fontSize: 12,
        opacity: 0.6,
    },
});
