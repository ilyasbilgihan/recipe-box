import { StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGlobalContext } from '~/context/GlobalProvider';

export default function StackLayout() {
  const { t } = useTranslation();
  const { ifLight } = useGlobalContext();
  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: ifLight('#FAF9FB', '#282c3d') } }}>
        <Stack.Screen
          name="confirm-recipe"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="manage-users"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="manage-categories"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="manage-ingredients"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
