import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useGlobalContext } from '~/context/GlobalProvider';

export default function TabLayout() {
  const { session } = useGlobalContext();

  if (!session) return <Redirect href="/auth" />;
  return (
    <Tabs
      initialRouteName="index"
      backBehavior="history"
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
          tabBarIcon: ({ color, focused }) =>
            !focused ? (
              <Ionicons size={22} name="home-outline" color={color} />
            ) : (
              <Ionicons size={22} name="home" color={color} />
            ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) =>
            !focused ? (
              <Ionicons size={22} name="compass-outline" color={color} />
            ) : (
              <Ionicons size={22} name="compass" color={color} />
            ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="create-recipe"
        options={{
          title: 'Create Recipe',
          tabBarIcon: ({ color, focused }) =>
            !focused ? (
              <Ionicons size={22} name="restaurant-outline" color={color} />
            ) : (
              <Ionicons size={22} name="restaurant" color={color} />
            ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) =>
            !focused ? (
              <Ionicons size={22} name="person-outline" color={color} />
            ) : (
              <Ionicons size={22} name="person" color={color} />
            ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
