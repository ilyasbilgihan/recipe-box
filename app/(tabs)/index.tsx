import {
  ImageBackground,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import { QueryData } from '@supabase/supabase-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListRecipe from '~/components/ListRecipe';
const windowWidth = Dimensions.get('window').width;
import { Redirect, router, useFocusEffect } from 'expo-router';
import LazyImage from '~/components/LazyImage';
import { useTranslation } from 'react-i18next';

const userQuery = supabase.from('profile').select(`
  id,
  name,
  username,
  email,
  profile_image,
  profession
`);
type userData = QueryData<typeof userQuery>[0];

type CategoryData = {
  id: number;
  name: string;
};

export default function Home() {
  const isFocused = useIsFocused();
  const [user, setUser] = useState<userData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [recipes, setRecipes] = useState<any>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const { session, ifLight } = useGlobalContext();

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
      fetchCategories();
      fetchRecipes();
    }, [selectedCategory])
  );

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .eq('special', true)
      .order('id', { ascending: true });

    if (error) {
      console.log('error', error);
      return;
    }

    if (data) {
      setCategories(data);
    }
  };

  const fetchUserDetails = async () => {
    const { data, error } = await userQuery.eq('id', session?.user.id).single();

    setUser(data);
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserDetails();
    await fetchRecipes();
    setRefreshing(false);
  }, [selectedCategory]);

  const fetchRecipes = async () => {
    /* const { data, error } = await supabase
      .from('sorted_recipe')
      .select('*')
      .eq('status', 'confirmed') // we already fetching confirmed recipes but not for the current authenticated user.
      .is('alternative_of', null)
      .eq('category_id', selectedCategory)
      .order('created_at', { ascending: false })
      .limit(5); */

    /* Figured out a way to fetch by category without using sorted_recipe view */
    const { data, error } = await supabase
      .from('recipe')
      .select('*, recipe_category!inner(category_id), recipe_reaction!inner(rating.avg())')
      .eq('status', 'confirmed')
      .is('alternative_of', null)
      .filter('recipe_category.category_id', 'in', '(' + selectedCategory + ')')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      let sorted = [...data]?.sort((a, b) => {
        return b?.recipe_reaction[0]?.avg - a?.recipe_reaction[0]?.avg;
      });
      setRecipes(sorted);
    }
  };

  const { t } = useTranslation();
  return (
    <>
      <SafeAreaView>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View className="flex flex-row items-center justify-between bg-warning-400 px-7 pb-12 pt-4">
            <View className="flex flex-col ">
              <Text className="font-qs text-xl text-light">
                Hi, <Text className="font-qs-bold">{user?.name || '@' + user?.username}</Text>
              </Text>
              <Text className="font-qs text-light">{user?.profession}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                router.push(`/profile`);
              }}>
              <LazyImage
                source={
                  user?.profile_image
                    ? { uri: user.profile_image }
                    : require('~/assets/images/no-image.png')
                }
                className="h-16 w-16 rounded-full bg-light"
              />
            </TouchableOpacity>
          </View>
          <ImageBackground
            source={ifLight(
              require(`~/assets/images/welcome.webp`),
              require(`~/assets/images/welcome-dark.webp`)
            )}
            style={{ width: windowWidth, aspectRatio: 2 / 1, paddingHorizontal: 28 }}>
            <View className="mt-4">
              {
                // @ts-ignore
                t('welcome', { returnObjects: true }).map((row, i) => {
                  return (
                    <Text className="text-right" key={'row-' + i}>
                      {row.map((col: any, j: any) => (
                        <Text
                          className={`${col.bold ? 'font-qs-bold' : 'font-qs'} text-3xl text-light`}
                          key={'cell-' + i + 'x' + j}>
                          {col.text}
                        </Text>
                      ))}
                    </Text>
                  );
                })
              }
            </View>
          </ImageBackground>
          <FlatList
            data={categories}
            contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={{ borderRadius: 20 }}
                className={`${selectedCategory == item.id ? 'bg-warning-400' : 'bg-back'} justify-center px-6 py-2  shadow-soft-5`}>
                <Text
                  className={`${selectedCategory == item.id ? ' text-warning-50' : 'text-dark'} font-qs-semibold`}>
                  {item?.name}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View className="w-2 " />}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => 'category-' + item.id}
            /* extraData={selectedId}  // rerender when selectedId changes */
          />
          <ListRecipe recipes={recipes} />
        </ScrollView>
      </SafeAreaView>
      {isFocused ? (
        <StatusBar
          backgroundColor={ifLight('rgb(251 149 75)', 'rgb(231 120 40)')}
          barStyle={'light-content'}
        />
      ) : null}
    </>
  );
}
