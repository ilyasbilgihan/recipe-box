import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';

import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useGlobalContext } from '~/context/GlobalProvider';

const windowWidth = Dimensions.get('window').width;

const RecipeItem = ({ recipe }: any) => {
  const { ifLight } = useGlobalContext();

  return (
    <TouchableOpacity
      onPress={() => {
        if (recipe?.id) {
          router.push(`/recipe/${'' + recipe.id}`);
        }
      }}
      activeOpacity={0.75}
      style={{ width: (windowWidth - 72) / 2 }}
      className="flex flex-col overflow-hidden rounded-xl bg-back shadow-soft-5">
      <Image
        source={{ uri: recipe?.thumbnail }}
        style={{ width: (windowWidth - 72) / 2 }}
        className="aspect-square"
      />
      <View className="flex flex-1 flex-col justify-between p-3">
        <Text className="mb-4 font-qs-semibold text-lg text-dark">{recipe?.name}</Text>
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-1 ">
            <Ionicons name="star" size={20} color={ifLight('#FB954B', 'rgb(231 120 40)')} />
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
  );
};

export default RecipeItem;
