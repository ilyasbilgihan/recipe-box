import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

import { Ionicons } from '@expo/vector-icons';
import { ButtonText, Button } from '~/components/ui/button';
import LazyImage from '~/components/LazyImage';
import { Switch } from '~/components/ui/switch';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '~/components/ui/select';
import { useTranslation } from 'react-i18next';

type Counts = {
  recipe: number | null;
  user: number | null;
  category: number | null;
  ingredient: number | null;
};

const languages = [
  { name: 'English', code: 'en' },
  { name: 'Français', code: 'fr' },
  { name: 'Türkçe', code: 'tr' },
];

const Settings = () => {
  const { session, ifLight, toggleColorMode, colorMode, setLanguage } = useGlobalContext();
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState<Counts>({
    recipe: 0,
    user: 0,
    category: 0,
    ingredient: 0,
  });

  const { t, i18n } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
      fetchCounts();
    }, [])
  );

  const fetchUserDetails = async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', session?.user.id)
      .single();

    if (error) {
      console.log('fetchUserDetails error', error);
    }

    setUser(data);
  };

  const fetchCounts = async () => {
    const { count: unconfirmedCount } = await supabase
      .from('recipe')
      .select('*', { count: 'estimated', head: true })
      .eq('status', 'idle');

    const { count: userCount } = await supabase
      .from('profile')
      .select('*', { count: 'estimated', head: true });

    const { count: categoryCount } = await supabase
      .from('category')
      .select('*', { count: 'estimated', head: true });

    const { count: ingredientCount } = await supabase
      .from('ingredient')
      .select('*', { count: 'estimated', head: true });

    setCounts({
      recipe: unconfirmedCount,
      user: userCount,
      category: categoryCount,
      ingredient: ingredientCount,
    });
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex w-full flex-1 px-7 font-qs-medium ">
          <View className="h-16 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}>
              <Ionicons
                size={24}
                name="chevron-back"
                color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
              />
            </TouchableOpacity>
            <Text className="font-qs-bold text-2xl text-dark">Settings</Text>
            <View className="w-6"></View>
          </View>
          <View className="my-5 flex flex-col items-center gap-4">
            <LazyImage
              source={
                user?.profile_image
                  ? { uri: user?.profile_image }
                  : require('~/assets/images/no-image.png')
              }
              className="h-24 w-24 rounded-full bg-outline-100"
            />
            <View className="items-center gap-1.5">
              <Text className="font-qs-semibold text-2xl text-dark">
                {user?.name || '@' + user?.username}
              </Text>
              <Text className="font-qs-medium text-dark">{user?.email}</Text>
            </View>
            <Button
              className="mt-4 h-11 rounded-full bg-dark"
              onPress={() => {
                router.push('/profile-detail');
              }}>
              <ButtonText className="font-qs-medium text-sm font-semibold text-light">
                Edit profile
              </ButtonText>
            </Button>
          </View>
          {user?.role === 'admin' || user?.role === 'moderator' ? (
            <>
              <Text className="mb-2 ml-4 font-qs-medium text-dark">Management</Text>
              <View className="mb-7 rounded-xl bg-back shadow-hard-3">
                <TouchableOpacity
                  onPress={() => {
                    router.push('/(stack)/(admin)/confirm-recipe');
                  }}
                  activeOpacity={0.5}
                  className="flex-row items-center gap-3 p-4">
                  <Ionicons
                    size={24}
                    name="document-text-outline"
                    color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                  />
                  <Text className="font-qs-semibold text-dark">Confirm Recipes</Text>
                  <View className="ml-auto rounded-xl bg-error-400 px-4 py-1">
                    <Text className="font-qs-medium text-error-50">{counts?.recipe}</Text>
                  </View>
                </TouchableOpacity>
                {user?.role === 'admin' ? (
                  <>
                    <View className="h-px w-full bg-outline-50"></View>
                    <TouchableOpacity
                      onPress={() => {
                        router.push('/(stack)/(admin)/manage-users');
                      }}
                      activeOpacity={0.5}
                      className="flex-row items-center gap-3 p-4">
                      <Ionicons
                        size={24}
                        name="people-outline"
                        color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                      />
                      <Text className="font-qs-semibold text-dark">Users</Text>
                      <View className="ml-auto rounded-xl bg-info-400 px-4 py-1">
                        <Text className="font-qs-medium text-info-50">{counts?.user}</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : null}

                <View className="h-px w-full bg-outline-50"></View>
                <TouchableOpacity
                  onPress={() => {
                    router.push('/(stack)/(admin)/manage-categories');
                  }}
                  activeOpacity={0.5}
                  className="flex-row items-center gap-3 p-4">
                  <Ionicons
                    size={24}
                    name="funnel-outline"
                    color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                  />
                  <Text className="font-qs-semibold text-dark">Categories</Text>
                  <View className="ml-auto rounded-xl bg-warning-400 px-4 py-1">
                    <Text className="font-qs-medium text-warning-50">{counts?.category}</Text>
                  </View>
                </TouchableOpacity>
                <View className="h-px w-full bg-outline-50"></View>
                <TouchableOpacity
                  onPress={() => {
                    router.push('/(stack)/(admin)/manage-ingredients');
                  }}
                  activeOpacity={0.5}
                  className="flex-row items-center gap-3 p-4">
                  <Ionicons
                    size={24}
                    name="pricetags-outline"
                    color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                  />
                  <Text className="font-qs-semibold text-dark">Ingredients</Text>
                  <View className="ml-auto rounded-xl bg-success-400 px-4 py-1">
                    <Text className="font-qs-medium text-success-50">{counts?.ingredient}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
          <Text className="mb-2 ml-4 font-qs-medium text-dark">Preferences</Text>
          <View className="mb-7 rounded-xl bg-back shadow-hard-3">
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                toggleColorMode();
              }}
              className="flex-row items-center gap-3 p-4">
              <Ionicons
                size={24}
                name="moon-outline"
                color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
              />
              <Text className="font-qs-semibold text-dark">Dark Mode</Text>
              <Switch
                trackColor={{
                  false: ifLight('rgb(238 240 255)', 'rgb(40 44 61)'),
                  true: ifLight('rgb(238 240 255)', 'rgb(40 44 61)'),
                }}
                defaultValue={colorMode === 'dark'}
                value={colorMode === 'dark'}
                onToggle={() => {
                  toggleColorMode();
                }}
                className="-my-4 ml-auto"
                thumbColor={'rgb(253 254 254)'}
              />
            </TouchableOpacity>
            <View className="h-px w-full bg-outline-50"></View>
            <Select
              onValueChange={(value) => {
                i18n.changeLanguage(value);
                setLanguage(value);
              }}>
              <View className="flex-row items-center p-4">
                <SelectTrigger className="w-full gap-3 border-0" variant="outline" size="md">
                  <Ionicons
                    size={24}
                    name="language-outline"
                    color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                  />
                  <Text className="font-qs-semibold text-dark">Language</Text>
                  <View className="ml-auto">
                    <Text className="font-qs-medium text-sm text-dark">
                      {t('current_language')}
                    </Text>
                  </View>
                </SelectTrigger>
              </View>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {languages.map(({ name, code }) => (
                    <SelectItem key={code} label={name} value={code} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
            <View className="h-px w-full bg-outline-50"></View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                supabase.auth.signOut();
                router.push('/auth');
              }}
              className="flex-row items-center gap-3 rounded-b-xl bg-error-500 p-4">
              <Ionicons size={24} name="log-out-outline" color={'rgb(254 226 226)'} />
              <Text className="font-qs-semibold text-error-50">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
