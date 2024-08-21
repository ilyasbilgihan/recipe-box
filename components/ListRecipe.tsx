import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import React from 'react';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { SharedTransition } from 'react-native-reanimated';

const windowWidth = Dimensions.get('window').width;

import { router } from 'expo-router';

const ListRecipe = ({ recipes }: { recipes: any[] }) => {
  return (
    <View className="flex flex-row flex-wrap items-stretch gap-6 px-7 pb-7">
      {recipes?.map((recipe, index) => (
        <TouchableOpacity
          key={'recipe-' + index}
          onPress={() => {
            if (recipe?.id) {
              // @ts-ignore
              router.push(`/recipe/${'' + recipe.id}`);
            }
          }}
          activeOpacity={0.75}
          style={{ width: (windowWidth - 72) / 2 }}
          className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
          <Image
            source={{ uri: recipe?.thumbnail }}
            style={{ width: (windowWidth - 72) / 2 }}
            className="aspect-square"
          />
          <View className="flex flex-1 flex-col justify-between p-3">
            <Text className="mb-4 font-qs-semibold text-lg text-dark">{recipe?.name}</Text>
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-1 ">
                <Ionicons name="star" size={20} color={'#FB954B'} />
                <Text className="font-qs-medium text-dark">
                  {recipe?.rating
                    ? recipe.rating.toFixed(1)
                    : recipe?.recipe_reaction
                      ? recipe.recipe_reaction[0]?.avg?.toFixed(1) || '-'
                      : '-'}
                </Text>
              </View>
              <View className="flex flex-row items-center gap-1 ">
                <Ionicons name="time-outline" size={20} color={'rgb(159 161 175)'} />
                <Text className="font-qs-medium text-dark">{recipe?.duration} min</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ListRecipe;
