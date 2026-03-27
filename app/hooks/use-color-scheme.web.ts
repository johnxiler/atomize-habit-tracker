import { useEffect, useState } from 'react';
import { useThemeContext } from '@/context/theme-context';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { activeTheme } = useThemeContext();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (hasHydrated) {
    return activeTheme;
  }

  return 'light';
}
