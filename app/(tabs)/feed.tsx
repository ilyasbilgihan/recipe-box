import { View, Text, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { useGlobalContext } from '~/context/GlobalProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import ListRecipe from '~/components/ListRecipe';
import { useTranslation } from 'react-i18next';

const Bookmark = () => {
  const { t } = useTranslation();
  const { session } = useGlobalContext();
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState<any>([]);
  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [])
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  }, []);

  const fetchFeed = async () => {
    console.log('fetch ');
    const { data, error } = await supabase
      .from('follow')
      .select(
        'profile!following_id(*, recipe(id, created_at, name, duration, thumbnail, recipe_reaction(rating.avg())))'
      )
      .eq('follower_id', session?.user.id);

    console.log('errr-> ', error);
    setRecipes(
      data
        ?.map((item: any) => {
          return item.profile.recipe;
        })
        .flat()
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    );
  };

  return (
    <SafeAreaView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="h-16 flex-row items-center justify-center px-7">
          <Text className="font-qs-bold text-2xl text-dark">
            {t('your_feed')} ({recipes?.length})
          </Text>
        </View>
        <ListRecipe recipes={recipes} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Bookmark;
