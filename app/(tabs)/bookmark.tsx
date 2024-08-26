import { View, Text, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { useGlobalContext } from '~/context/GlobalProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import ListRecipe from '~/components/ListRecipe';

const Bookmark = () => {
  const { session } = useGlobalContext();
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState<any>([]);
  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [])
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmark')
      .select('*, recipe(*, recipe_reaction(rating.avg()))')
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false });

    if (data) {
      console.log('bookmarked ->', data);
      setRecipes([...data].map((item) => item.recipe));
    }
  };

  return (
    <SafeAreaView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="h-16 flex-row items-center justify-center px-7">
          <Text className="font-qs-bold text-2xl text-dark">Bookmarks ({recipes.length})</Text>
        </View>
        <ListRecipe recipes={recipes} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Bookmark;
