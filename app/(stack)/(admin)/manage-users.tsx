import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import { BottomSheetModal, BottomSheetFooter } from '@gorhom/bottom-sheet';
import BottomSheet from '~/components/BottomSheet';
import LazyImage from '~/components/LazyImage';
import { Button, ButtonText } from '~/components/ui/button';
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

const roleDetail = {
  admin: { colorLight: 'rgb(192 132 252)', colorDark: 'rgb(168 85 247)', name: 'Admin' },
  user: { colorLight: 'rgb(140 141 141)', colorDark: 'rgb(165 163 163)', name: 'User' },
  moderator: { colorLight: 'rgb(13 166 242)', colorDark: 'rgb(50 180 244)', name: 'Moderator' },
  editor: { colorLight: 'rgb(231 120 40)', colorDark: 'rgb(251 149 75)', name: 'Editor' },
};

const ManageUsers = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<any>([]);
  const [profile, setProfile] = useState<any>();
  const { ifLight } = useGlobalContext();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
    console.log(bottomSheetModalRef.current);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfiles();
    }, [])
  );

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profile').select('*');
    if (data) {
      setProfiles(data);
    }
  };

  const handleRoleChange = async (value: any) => {
    if (profile?.id) {
      const { data, error } = await supabase
        .from('profile')
        .update({ role: value })
        .eq('id', profile.id);

      if (!error) {
        fetchProfiles();
        bottomSheetModalRef.current?.dismiss();
      }
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView>
        <View className="w-full flex-1 px-7">
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
            <Text className="font-qs-bold text-2xl text-dark">{t('manage_users')}</Text>
            <View className="w-6"></View>
          </View>
          <View className="gap-4 pb-8">
            {profiles?.map((profile: any) => (
              <TouchableOpacity
                onPress={() => {
                  setProfile(profile);
                  handlePresentModalPress();
                }}
                activeOpacity={0.75}
                key={profile.id}
                style={{
                  borderTopLeftRadius: 38,
                  borderBottomLeftRadius: 38,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,
                }}
                className="relative flex-row items-center gap-4 bg-back p-3 shadow-soft-5">
                <Image
                  className="h-16 w-16 rounded-full"
                  source={
                    profile?.profile_image
                      ? { uri: profile.profile_image }
                      : require('~/assets/images/no-image.png')
                  }
                />
                <View>
                  <Text numberOfLines={2} className="font-qs-medium text-3xl text-dark">
                    {profile.name || '@' + profile.username}
                  </Text>
                  <Text className="font-qs text-sm text-dark opacity-80">{profile.email}</Text>
                </View>
                <View
                  style={{
                    transform: [{ rotate: '90deg' }],
                    transformOrigin: 'top left',
                    width: 76,
                    right: -76,
                    backgroundColor: ifLight(
                      //@ts-ignore
                      roleDetail[profile?.role]?.colorLight,
                      //@ts-ignore
                      roleDetail[profile?.role]?.colorDark
                    ),
                  }}
                  className="absolute top-px items-center rounded-t-xl pb-1">
                  <Text className="font-qs-medium text-sm" style={{ color: 'rgb(238 240 255)' }}>
                    {
                      // @ts-ignore
                      roleDetail[profile?.role]?.name
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomSheet
        footerComponent={(props) => (
          <BottomSheetFooter {...props} bottomInset={20} style={{ paddingHorizontal: 28 }}>
            <Button
              className="w-full rounded-md bg-error-500"
              onPress={() => {
                console.log('handle delete profile');
              }}>
              <ButtonText className="text-md font-medium text-error-50">
                {t('delete_user')}
              </ButtonText>
            </Button>
          </BottomSheetFooter>
        )}
        ref={bottomSheetModalRef}
        snapPoints={['33%', '66%']}>
        <View className="flex flex-col gap-4 px-7">
          <View className="mb-8">
            <Text
              style={{ color: ifLight('rgb(42 48 81)', 'rgb(238 240 255)') }}
              className="mt-4 font-qs-bold text-2xl">
              {t('user_details')}
            </Text>
          </View>
          <GHScrollView style={{ marginBottom: 20 }}>
            <View className="items-center gap-4">
              <LazyImage
                source={
                  profile?.profile_image
                    ? { uri: profile?.profile_image }
                    : require('~/assets/images/no-image.png')
                }
                className="h-32 w-32 rounded-full bg-outline-100"
              />
              <View className="items-center">
                <Text className="font-qs-medium text-3xl text-dark ">
                  {profile?.name || '@' + profile?.username}
                </Text>
                {profile?.profession ? (
                  <Text className="font-qs text-dark opacity-80">{profile?.profession}</Text>
                ) : null}
              </View>
            </View>
            <View className="my-12">
              <Text className="mb-2 font-qs-semibold text-dark opacity-80">{t('change_role')}</Text>
              <Select
                onValueChange={(value) => {
                  handleRoleChange(value);
                }}>
                <SelectTrigger
                  className="items-center justify-between bg-back dark:border-transparent dark:focus:border-stone-800"
                  variant="outline"
                  size="xl">
                  <Text className="ml-3 font-qs-medium text-dark opacity-80">
                    {
                      // @ts-ignore
                      roleDetail[profile?.role]?.name
                    }
                  </Text>
                  <View className="px-4">
                    <Ionicons name="chevron-down" size={14} color={'#737373'} />
                  </View>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {Object.entries(roleDetail).map(([key, val]) => (
                      <SelectItem key={key} label={val.name} value={key} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>
          </GHScrollView>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ManageUsers;
