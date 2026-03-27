import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { Colors, Spacing, Radius } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <MaterialIcons name="error-outline" size={64} color={Colors.primary} />
                    <ThemedText style={styles.title}>Oops! Something went wrong.</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        We encountered an unexpected error. {"Don't"} worry, your data is safe.
                    </ThemedText>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleRetry}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.buttonText}>Try Again</ThemedText>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
        backgroundColor: '#0f0f1a', // Using dark background for safety layer
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: Spacing.lg,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
        lineHeight: 20,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
