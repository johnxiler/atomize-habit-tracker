import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    activeTheme: ActiveTheme;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'system',
    setMode: () => { },
    activeTheme: 'dark', // Default fallback
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const nativeTheme = useNativeColorScheme() ?? 'dark';
    const [mode, setMode] = useState<ThemeMode>('system');

    const activeTheme = useMemo<ActiveTheme>(() => {
        if (mode === 'system') return nativeTheme;
        return mode;
    }, [mode, nativeTheme]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, activeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    return useContext(ThemeContext);
}
