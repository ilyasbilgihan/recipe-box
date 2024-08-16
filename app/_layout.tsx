import '../global.css';

import '../translation';

import { Stack, SplashScreen } from 'expo-router';

import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { GlobalProvider } from '~/context/GlobalProvider';
import { GluestackUIProvider } from '~/components/ui/gluestack-ui-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Quicksand Light': require('../assets/fonts/Quicksand-Light.ttf'),
    'Quicksand Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'Quicksand Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    Quicksand: require('../assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <GlobalProvider>
          <GluestackUIProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(stack)" options={{ headerShown: false }} />
            </Stack>
          </GluestackUIProvider>
        </GlobalProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
