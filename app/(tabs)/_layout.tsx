import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useGlobalContext } from '~/context/GlobalProvider';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  const { session, ifLight } = useGlobalContext();

  if (!session) return <Redirect href="/auth" />;
  return (
    <Tabs
      initialRouteName="index"
      backBehavior="history"
      sceneContainerStyle={{ backgroundColor: ifLight('#FAF9FB', '#282c3d') }}
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: ifLight('#FCA020', 'rgb(231 120 40)'),
        tabBarInactiveTintColor: ifLight('#9FA1AF', 'rgb(238 240 255)'),
        tabBarIconStyle: {
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          height: 20,
          fontSize: 11,
        },
        tabBarStyle: {
          height: 60,
          borderColor: ifLight('#FAF9FB', 'transparent'),
          backgroundColor: ifLight('#FAF9FB', 'rgb(52 54 79)'),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
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
          title: t('feed'),
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
          title: t('create_recipe'),
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
          title: t('profile'),
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
