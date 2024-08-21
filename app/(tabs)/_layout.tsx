import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '~/context/GlobalProvider';

import React from 'react';

export default function TabLayout() {
  const { session } = useGlobalContext();

  if (!session) return <Redirect href="/auth" />;
  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: '#FAF9FB' }}
      screenOptions={{
        tabBarActiveTintColor: '#FCA020',
        tabBarInactiveTintColor: '#9FA1AF',
        tabBarIconStyle: {
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          height: 20,
          fontSize: 11,
        },
        tabBarStyle: {
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="create-recipe"
        options={{
          title: 'Create Recipe',
          tabBarIcon: ({ color }) => <Ionicons name="create-outline" color={color} />,
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
      <Tabs.Screen
        name="profile/[id]"
        options={{
          href: {
            pathname: '/profile/[id]',
            params: {
              id: session.user.id,
            },
          },
          title: '@username',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" color={color} />,
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
    </Tabs>
  );
}
