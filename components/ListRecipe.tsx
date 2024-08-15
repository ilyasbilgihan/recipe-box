import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import React from 'react';
import { QueryData } from '@supabase/supabase-js';
import { supabase } from '~/utils/supabase';
import { TabBarIcon } from './TabBarIcon';

const windowWidth = Dimensions.get('window').width;

const recipeQuery = supabase.from('recipe').select(`
  id,
  name,
  thumbnail,
  created_at,
  duration,
  recipe_reaction (
    rating
  )
`);
type recipeData = QueryData<typeof recipeQuery>;

const ListRecipe = ({ recipes }: { recipes: recipeData }) => {
  return (
    <View className="flex flex-row flex-wrap items-stretch gap-4 px-7 pb-7">
      {recipes?.map((recipe, index) => (
        <TouchableOpacity
          key={'recipe-' + index}
          onPress={() => {
            console.log(recipe.name);
          }}
          activeOpacity={0.75}
          style={{ width: (windowWidth - 76) / 2 }}
          className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
          <Image
            source={{ uri: recipe.thumbnail }}
            style={{ width: (windowWidth - 76) / 2 }}
            className="aspect-square"
          />
          <View className="flex flex-1 flex-col justify-between p-3">
            <Text className="mb-4 font-qs-semibold text-lg text-dark">{recipe.name}</Text>
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-1 ">
                <TabBarIcon name="star" size={20} color={'#FB954B'} />
                <Text className="font-qs-medium text-dark">
                  {(
                    recipe.recipe_reaction?.reduce(
                      (accumulator, currentValue) => accumulator + currentValue.rating,
                      0
                    ) / recipe.recipe_reaction.length || 0
                  ).toFixed(1)}
                </Text>
              </View>
              <View className="flex flex-row items-center gap-1 ">
                <TabBarIcon name="clock-o" size={20} color={'rgb(159 161 175)'} />
                <Text className="font-qs-medium text-dark">{recipe.duration} min</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ListRecipe;
