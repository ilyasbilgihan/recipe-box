import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { Link, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import Swipeable, { SwipeableProps } from 'react-native-gesture-handler/Swipeable';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import LazyImage from '~/components/LazyImage';
import useCustomToast from '~/components/useCustomToast';

const ConfirmRecipe = () => {
  const toast = useCustomToast();
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
      .eq('status', 'idle');
    if (data) {
      setRecipes(data);
    }
  };

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
    const { error } = await supabase.from('recipe').update({ status: 'rejected' }).eq('id', id);
    if (error) {
      console.log('error', error);
    } else {
      toast.error('Recipe rejected');
      fetchUnconfirmedRecipes();
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
            <Text className="font-qs-bold text-2xl text-dark">Confirm Recipe</Text>
            <View className="w-6"></View>
          </View>
          <View>
            <View className="gap-4 pb-8">
              {recipes.length > 0 ? (
                recipes.map((recipe: any) => (
                  <Swipeable
                    containerStyle={{ paddingHorizontal: 28 }}
                    key={recipe.id}
                    renderLeftActions={() => {
                      return (
                        <View className="w-full flex-row items-center px-14">
                          <Text className="font-qs-medium text-2xl text-success-400">Confirm</Text>
                        </View>
                      );
                    }}
                    renderRightActions={() => {
                      return (
                        <View className="w-full flex-row items-center justify-end px-14">
                          <Text className="font-qs-medium text-2xl text-error-400">Reject</Text>
                        </View>
                      );
                    }}
                    onSwipeableWillOpen={(direction) => {
                      console.log(direction);
                      if (direction === 'left') {
                        handleConfirmRecipe(recipe.id);
                      } else {
                        handleRejectRecipe(recipe.id);
                      }
                      //setRecipes(recipes.filter((item: any) => item.id !== recipe.id));
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
                ))
              ) : (
                <View className="items-center gap-4 py-8">
                  <Ionicons
                    name="logo-snapchat"
                    size={64}
                    color={ifLight('#3d3d3d', 'rgb(122 124 149)')}
                  />
                  <Text className="px-20 text-center font-qs-medium text-lg text-dark">
                    There are no recipes waiting to be confirmed.
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

export default ConfirmRecipe;
