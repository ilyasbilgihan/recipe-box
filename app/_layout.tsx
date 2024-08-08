import '../global.css';

import '../translation';

import { Stack, SplashScreen } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { GlobalProvider } from '~/context/GlobalProvider';

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Publica Play': require('../assets/fonts/PublicaPlay.otf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded && !error) return null;

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GlobalProvider>
  );
}
