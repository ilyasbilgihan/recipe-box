import { StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function StackLayout() {
  const { t } = useTranslation();
  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: '#FAF9FB' } }}>
        <Stack.Screen
          name="auth"
          options={{
            title: t('login'),
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#FAF9FB',
            },
            headerTitleStyle: {
              fontFamily: 'Quicksand SemiBold',
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#FAF9FB',
            },
            headerTitleStyle: {
              fontFamily: 'Quicksand SemiBold',
            },
            headerTitleAlign: 'center',
            headerRight(props) {
              return (
                <TouchableOpacity
                  onPress={() => {
                    supabase.auth.signOut();
                    router.push('/auth');
                  }}>
                  <Ionicons size={24} name="log-out-outline" color={'rgb(220 38 38)'} />
                </TouchableOpacity>
              );
            },
            headerLeft(props) {
              return (
                <TouchableOpacity
                  onPress={() => {
                    router.back();
                  }}>
                  <Ionicons size={24} name="chevron-back" color={'rgb(42 48 81)'} />
                </TouchableOpacity>
              );
            },
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
      </Stack>
      <StatusBar backgroundColor="#FAF9FB" />
    </>
  );
}
