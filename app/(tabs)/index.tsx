import { Link } from 'expo-router';
import {
  ImageBackground,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  RefreshControl,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useCallback } from 'react';
import { QueryData } from '@supabase/supabase-js';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '~/components/TabBarIcon';
import ListRecipe from '~/components/ListRecipe';
const windowWidth = Dimensions.get('window').width;
import { router } from 'expo-router';
const userQuery = supabase.from('profile').select(`
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

  const { session } = useGlobalContext();

  useEffect(() => {
    fetchUserDetails();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category')
      .select('*')
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
    if (data?.profile_image) {
      data.profile_image = data?.profile_image + '?time=' + new Date().getTime(); // Add timestamp to prevent caching
    }
    setUser(data);
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchUserDetails();
      fetchRecipes();
      setRefreshing(false);
    }, 1000);
  }, [selectedCategory]);

  const fetchRecipes = async () => {
    console.log('CAT', selectedCategory);
    const { data, error } = await supabase
      .from('recipe')
      .select(
        `
      id,
      name,
      thumbnail,
      created_at,
      duration,
      recipe_category!inner(
        id,
        category!inner(name)
      ),
      recipe_reaction (
        rating
      )
    `
      )
      .eq('confirmed', true)
      .eq('recipe_category.category_id', selectedCategory)
      .order('created_at', { ascending: false })
      .limit(2);

    setRecipes(data);
  };

  return (
    <>
      <SafeAreaView>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View className="flex flex-row items-center justify-between bg-warning-400 px-7 pb-12 pt-4">
            <View className="flex flex-col ">
              <Text className="font-qs text-xl text-light">
                Hi, <Text className="font-qs-bold">{user?.name || user?.username}</Text>
              </Text>
              <Text className="font-qs text-light">{user?.profession}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                router.replace('/profile');
              }}>
              <Image
                source={
                  user?.profile_image
                    ? { uri: user.profile_image }
                    : require('~/assets/images/no-image.png')
                }
                className="h-16 w-16 rounded-full"
              />
            </TouchableOpacity>
          </View>
          <ImageBackground
            source={require('~/assets/images/welcome.webp')}
            style={{ width: windowWidth, aspectRatio: 2 / 1, paddingHorizontal: 28 }}>
            <Text className="ml-auto mt-4 text-right font-qs text-3xl text-light">
              <Text className="text-right font-qs-bold">Find</Text>
              {` your food
recipe `}
              <Text className="font-qs-bold">easily</Text>
            </Text>
          </ImageBackground>
          <FlatList
            data={categories}
            contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={{ borderRadius: 20 }}
                className={`${selectedCategory == item.id ? 'bg-warning-400' : 'bg-white'} justify-center px-6 py-2  shadow-md`}>
                <Text
                  className={`${selectedCategory == item.id ? ' text-light' : 'text-dark'} font-qs-semibold`}>
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
          {recipes ? <ListRecipe recipes={recipes} /> : null}
        </ScrollView>
      </SafeAreaView>
      {isFocused ? <StatusBar backgroundColor="#FB954B" barStyle={'light-content'} /> : null}
    </>
  );
}
