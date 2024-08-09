import { Tabs, Redirect } from 'expo-router';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useGlobalContext } from '~/context/GlobalProvider';

import React from 'react';

export default function TabLayout() {
  const { session } = useGlobalContext();

  if (!session) return <Redirect href="/sign-in" />;
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
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="bookmark"
        options={{
          title: 'Bookmark',
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmark-o" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user-o" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
