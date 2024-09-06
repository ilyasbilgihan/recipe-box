import { View, Text, Alert } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import CreateRecipe from '~/app/(tabs)/create-recipe';
import { supabase } from '~/utils/supabase';
import useCustomToast from '~/components/useCustomToast';

type RecipeIngredient = {
  ingredient_id: string | undefined;
  name: string;
  image: string;
  amount: string;
  unit: string;
};

const EditRecipe = () => {
  const toast = useCustomToast();

  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = React.useState<{
    name: string;
    owner: string;
    alternative_of: string;
    duration: string;
    instructions: string;
    thumbnail: string;
    categories: { id: any; name: any }[];
    ingredients: RecipeIngredient[];
  }>({
    name: '',
    owner: '',
    alternative_of: '',
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
        '*, owner:profile(id), recipe_ingredient(*, ingredient(name, image)), recipe_category(category(id,name))'
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
        owner: data.owner,
        alternative_of: data.alternative_of,
        duration: '' + data.duration,
        instructions: data.instructions,
        thumbnail: data.thumbnail || '',
        categories: categories,
        ingredients: ingredients,
      });

      if (data.status === 'rejected') {
        toast.error('This recipe offer is rejected', 3000);
        setTimeout(() => {
          toast.warning(data.reject_reason, 10000);
        }, 3100);
      }
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
