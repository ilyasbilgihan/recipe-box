import { View, Text } from 'react-native';
import React, { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import CreateRecipe from '~/app/(tabs)/create-recipe';
import { supabase } from '~/utils/supabase';

type RecipeIngredient = {
  ingredient_id: string | undefined;
  name: string;
  image: string;
  amount: string;
  unit: string;
};

const EditRecipe = () => {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = React.useState<{
    name: string;
    duration: string;
    instructions: string;
    thumbnail: string;
    categories: { id: any; name: any }[];
    ingredients: RecipeIngredient[];
  }>({
    name: '',
    duration: '',
    instructions: '',
    thumbnail: '',
    categories: [],
    ingredients: [],
  });

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from('recipe')
      .select(
        '*, recipe_ingredient(*, ingredient(name, image)), recipe_category(category(id,name))'
      )
      .eq('id', id)
      .single();

    if (error) {
      console.log('error', error);
      return;
    }

    if (data) {
      let ingredients = [...data.recipe_ingredient].map((ing) => {
        return {
          ingredient_id: ing.ingredient_id,
          name: ing.ingredient.name,
          image: ing.ingredient.image,
          amount: ing.amount,
          unit: ing.unit,
        };
      });
      let categories = [...data.recipe_category].map((cat) => {
        return {
          id: cat.category.id,
          name: cat.category.name,
        };
      });
      setRecipe({
        name: data.name,
        duration: '' + data.duration,
        instructions: data.instructions,
        thumbnail: data.thumbnail || '',
        categories: categories,
        ingredients: ingredients,
      });
      console.log('edit data ing -> ', ingredients);
      console.log('edit data cat -> ', categories);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipe();
    }, [])
  );

  return <>{recipe.name ? <CreateRecipe id={id} recipe={recipe} /> : null}</>;
};

export default EditRecipe;
