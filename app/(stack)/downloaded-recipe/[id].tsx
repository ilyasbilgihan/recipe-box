import { View, Text } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Recipe from '~/app/(stack)/recipe/[id]';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getItem } from '~/core/storage';

const DownloadedRecipe = () => {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getRecipe();
    }, [])
  );

  const getRecipe = async () => {
    const item = await getItem('recipe_' + id);
    console.log('item', item);
    setRecipe(item);
  };

  return <>{recipe ? <Recipe downloadedRecipe={recipe} /> : null}</>;
};

export default DownloadedRecipe;
