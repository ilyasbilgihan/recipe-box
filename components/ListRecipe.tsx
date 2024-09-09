import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecipeItem from './RecipeItem';
import { useTranslation } from 'react-i18next';

const ListRecipe = ({ recipes, notFoundText }: { recipes: any[]; notFoundText?: string }) => {
  const { t } = useTranslation();

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
            className="mt-6 px-7 text-center font-qs-medium text-xl text-outline-400">
            {notFoundText || t('no_recipes')}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ListRecipe;
