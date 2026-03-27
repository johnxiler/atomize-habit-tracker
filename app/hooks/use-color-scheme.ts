import { useThemeContext } from '@/context/theme-context';
import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useColorScheme() {
    const { activeTheme } = useThemeContext();
    return activeTheme;
}
