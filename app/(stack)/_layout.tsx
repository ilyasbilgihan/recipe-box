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
          name="auth"
          options={{
            title: t('login'),
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile-detail"
          options={{
            title: 'Profile Detail',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-recipe/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(admin)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
