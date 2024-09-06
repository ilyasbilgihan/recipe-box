import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecipeItem from './RecipeItem';

const ListRecipe = ({ recipes }: { recipes: any[] }) => {
  return (
    <View>
      {recipes?.length > 0 ? (
        <View className="flex flex-row flex-wrap items-stretch gap-6 px-7 pb-7">
          {recipes?.map((recipe) => <RecipeItem key={recipe.id} recipe={recipe} />)}
        </View>
      ) : (
        <View className="items-center py-12">
          <Ionicons name="receipt-outline" size={80} color={'rgb(159 161 175)'} />
          <Text
            style={{ color: 'rgb(159 161 175)' }}
            className="font-qs-medium text-2xl text-outline-400">
            No recipes found
          </Text>
        </View>
      )}
    </View>
  );
};

export default ListRecipe;
