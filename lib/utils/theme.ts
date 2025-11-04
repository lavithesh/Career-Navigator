'use client';

import { useEffect, useState } from 'react';

export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    updateTheme(mediaQuery);
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  return systemTheme;
}