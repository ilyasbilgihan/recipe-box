import { Tabs, Redirect } from 'expo-router';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useGlobalContext } from '~/context/GlobalProvider';

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { supabase } from '~/utils/supabase';

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
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="create-recipe"
        options={{
          title: 'Create Recipe',
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
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
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user-o" color={color} />,
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
                className="mr-6">
                <TabBarIcon name="sign-out" color={'rgb(220 38 38)'} />
              </TouchableOpacity>
            );
          },
        }}
      />
    </Tabs>
  );
}
