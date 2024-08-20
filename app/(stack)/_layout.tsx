import { StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { TabBarIcon } from '~/components/TabBarIcon';

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
            title: '@username',
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
                  }}
                  className="mr-7">
                  <TabBarIcon name="sign-out" color={'rgb(220 38 38)'} />
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
      </Stack>
      <StatusBar backgroundColor="#FAF9FB" />
    </>
  );
}
