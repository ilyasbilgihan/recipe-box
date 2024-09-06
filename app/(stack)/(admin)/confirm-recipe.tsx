import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

import useCustomToast from '~/components/useCustomToast';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter } from '~/components/ui/modal';
import { FormControl } from '~/components/ui/form-control';
import { Button, ButtonSpinner, ButtonText } from '~/components/ui/button';
import { Textarea, TextareaInput } from '~/components/ui/textarea';
import { useTranslation } from 'react-i18next';

const ConfirmRecipe = () => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<any>([]);

  const { ifLight } = useGlobalContext();
  useFocusEffect(
    useCallback(() => {
      fetchUnconfirmedRecipes();
    }, [])
  );

  const fetchUnconfirmedRecipes = async () => {
    const { data, error } = await supabase
      .from('recipe')
      .select('*, profile(id, name, username, profile_image)')
      .eq('status', 'pending');
    if (data) {
      setRecipes(data);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="w-full flex-1">
          <View className="h-16 flex-row items-center justify-between  px-7">
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
            <Text className="font-qs-bold text-2xl text-dark">{t('confirm_recipes')}</Text>
            <View className="w-6"></View>
          </View>
          <View>
            <View className="gap-4 pb-8">
              {recipes.length > 0 ? (
                recipes.map((recipe: any) => (
                  <SwipeableItem
                    recipe={recipe}
                    key={recipe.id}
                    fetchUnconfirmedRecipes={fetchUnconfirmedRecipes}
                  />
                ))
              ) : (
                <View className="items-center gap-4 py-8">
                  <Ionicons
                    name="logo-snapchat"
                    size={64}
                    color={ifLight('#3d3d3d', 'rgb(122 124 149)')}
                  />
                  <Text className="px-20 text-center font-qs-medium text-lg text-dark">
                    {t('no_recipes_to_confirm')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SwipeableItem = ({ recipe, fetchUnconfirmedRecipes }: any) => {
  const { t } = useTranslation();
  const toast = useCustomToast();
  const [reason, setReason] = useState<string>('');
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rejectId, setRejectId] = useState<any>();

  const ref = useRef<Swipeable | null>(null);
  const handleConfirmRecipe = async (id: any) => {
    const { error } = await supabase.from('recipe').update({ status: 'confirmed' }).eq('id', id);
    if (error) {
      console.log('error', error);
    } else {
      toast.success('Recipe confirmed');
      fetchUnconfirmedRecipes();
    }
  };

  const handleRejectRecipe = async (id: any) => {
    let rejectReason = reason.trim();
    if (!rejectReason) {
      toast.warning('Reason is required');
      return;
    }

    if (!loading) {
      setLoading(true);

      const { error } = await supabase
        .from('recipe')
        .update({ status: 'rejected', reject_reason: rejectReason })
        .eq('id', id);
      if (error) {
        console.log('error', error);
      } else {
        toast.success('Recipe rejected');
        fetchUnconfirmedRecipes();
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Swipeable
        ref={ref}
        containerStyle={{ paddingHorizontal: 28 }}
        key={recipe.id}
        renderLeftActions={() => {
          return (
            <View className="w-full flex-row items-center px-14">
              <Text className="font-qs-medium text-2xl text-success-400">{t('confirm')}</Text>
            </View>
          );
        }}
        renderRightActions={() => {
          return (
            <View className="w-1/2 flex-row items-center justify-end px-14">
              <Text className="font-qs-medium text-2xl text-error-400">{t('reject')}</Text>
            </View>
          );
        }}
        onSwipeableWillOpen={(direction) => {
          console.log(direction);
          if (direction === 'left') {
            handleConfirmRecipe(recipe.id);
          } else {
            setRejectId(recipe.id);
            setReason('');
            setModal(true);
          }
        }}>
        <View className="flex-row rounded-3xl bg-back p-3 shadow-soft-5">
          <Image className="h-28 w-28 rounded-xl" source={{ uri: recipe.thumbnail }} />
          <View className="flex-1 justify-between py-1 pl-4 pr-1">
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push(`/recipe/${recipe.id}`)}>
              <Text numberOfLines={2} className="font-qs-medium text-3xl text-dark">
                {recipe.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push(`/profile/${recipe.profile.id}`)}
              className="ml-auto flex-row items-center gap-2">
              <Text className="font-qs-semibold text-dark">
                {recipe.profile.name || '@' + recipe.profile.username}
              </Text>
              <Image
                className="h-8 w-8 rounded-full"
                source={
                  recipe.profile?.profile_image
                    ? { uri: recipe.profile.profile_image }
                    : require('~/assets/images/no-image.png')
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
      <Modal isOpen={modal}>
        <ModalBackdrop />
        <ModalContent className="max-w-[375px] bg-light">
          <ModalBody className="mb-5 " contentContainerClassName="">
            <Text className="font-qs-medium text-xl text-dark">{t('rejecting_recipe')}</Text>
            <Text className="text text-left font-qs text-typography-500">
              {t('provide_reject_reason')}
            </Text>
            <View className="mt-4 flex flex-col gap-2">
              <FormControl>
                <Textarea>
                  <TextareaInput
                    numberOfLines={5}
                    defaultValue={reason}
                    onChange={(e) => setReason(e.nativeEvent.text)}
                    textAlignVertical="top"
                    placeholder={t('reason_placeholder')}
                    className="p-3"
                  />
                </Textarea>
              </FormControl>
            </View>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => {
                setModal(false);
                ref.current?.close();
              }}
              className="flex-1">
              <ButtonText>{t('cancel')}</ButtonText>
            </Button>
            <Button
              disabled={loading}
              onPress={() => {
                handleRejectRecipe(rejectId);
              }}
              size="sm"
              className="flex-1 bg-info-400">
              {loading ? (
                <ButtonSpinner size={16} className="mr-2" color={'rgb(199 235 252)'} />
              ) : null}
              <ButtonText className="text-md font-medium text-info-50">{t('confirm')}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmRecipe;
