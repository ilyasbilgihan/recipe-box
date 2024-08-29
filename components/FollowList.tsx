import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';

import useImagePicker from '~/utils/useImagePicker';

import { BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheet from '~/components/BottomSheet';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from './ui/form-control';

import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter } from './ui/modal';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from './ui/select';
import { Input } from './ui/input';
import { Button, ButtonText } from './ui/button';
import ImagePickerInput from './ImagePickerInput';
import { ImagePickerAsset } from 'expo-image-picker';
import useCustomToast from './useCustomToast';
import LazyImage from './LazyImage';
import { router } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

type newIngredient = { name: string; image: ImagePickerAsset };

const FollowListTrigger = ({
  list,
  children,
  title,
  checkFollow,
}: {
  list: any;
  children: React.ReactNode;
  title: string;
  checkFollow: any;
}) => {
  const { session, ifLight } = useGlobalContext();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleFollow = async (id: any) => {
    const { error } = await supabase
      .from('follow')
      .insert({ follower_id: session?.user.id, following_id: id });
    console.log('follow err', error);

    checkFollow();
  };

  const handleUnfollow = async (id: any) => {
    const { error } = await supabase
      .from('follow')
      .delete()
      .eq('follower_id', session?.user.id)
      .eq('following_id', id);

    checkFollow();
  };

  useEffect(() => {
    // custom back handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      bottomSheetModalRef.current?.forceClose();
      return null;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <>
      <TouchableOpacity activeOpacity={0.75} onPress={handlePresentModalPress}>
        {children}
      </TouchableOpacity>
      <BottomSheet ref={bottomSheetModalRef} snapPoints={['50%', '75%']}>
        <View className="flex flex-col gap-4 px-7">
          <View>
            <Text
              style={{ color: ifLight('rgb(42 48 81)', 'rgb(228 230 255)') }}
              className="mt-4 font-qs-bold text-2xl">
              {title}
            </Text>
          </View>
          <GHScrollView style={{ marginBottom: 20 }}>
            <View className="gap-4">
              {list?.length > 0
                ? list.map((item: any) => {
                    return (
                      <View key={item.id} className="flex-row items-center justify-between">
                        <TouchableOpacity
                          activeOpacity={0.75}
                          onPress={() => {
                            router.push(`/profile/${item.id}`);
                          }}>
                          <View className="flex-row items-center gap-3">
                            <LazyImage
                              source={
                                item?.profile_image
                                  ? { uri: item.profile_image }
                                  : require('~/assets/images/no-image.png')
                              }
                              className="h-16 w-16 rounded-xl bg-outline-100"
                            />
                            <View>
                              <Text
                                style={{ color: ifLight('rgb(42 48 81)', 'rgb(228 230 255)') }}
                                className="font-qs-semibold text-lg">
                                @{item.username}
                              </Text>
                              {item?.name ? (
                                <Text
                                  style={{ color: ifLight('rgb(42 48 81)', 'rgb(228 230 255)') }}
                                  className="font-qs-medium">
                                  {item.name}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </TouchableOpacity>
                        <View>
                          {item.id == session?.user.id ? null : item.followers.length > 0 ? (
                            <Button
                              style={{ borderColor: ifLight('rgb(13 166 242)', 'rgb(50 180 244)') }}
                              className=" h-10 rounded-lg border bg-light"
                              onPress={() => {
                                handleUnfollow(item.id);
                              }}>
                              <ButtonText
                                style={{ color: ifLight('rgb(13 166 242)', 'rgb(50 180 244)') }}
                                className="text-md font-medium">
                                Following
                              </ButtonText>
                            </Button>
                          ) : (
                            <Button
                              style={{
                                backgroundColor: ifLight('rgb(13 166 242)', 'rgb(50 180 244)'),
                              }}
                              className="h-10 rounded-lg "
                              onPress={() => {
                                handleFollow(item.id);
                              }}>
                              <ButtonText className="text-md font-medium text-light">
                                Follow
                              </ButtonText>
                            </Button>
                          )}
                        </View>
                      </View>
                    );
                  })
                : null}
            </View>
          </GHScrollView>
        </View>
      </BottomSheet>
    </>
  );
};

export default FollowListTrigger;
