import { StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function StackLayout() {
  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: '#FAF9FB' } }}>
        <Stack.Screen
          name="auth"
          options={{
            title: 'Login',
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
                  }}
                  className="mr-7">
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
      </Stack>
      <StatusBar backgroundColor="#FAF9FB" />
    </>
  );
}
