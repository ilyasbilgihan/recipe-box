import { View, Text, Image, BackHandler } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useNavigation, router, Redirect } from 'expo-router';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { supabase } from '~/utils/supabase';
import ListRecipe from '~/components/ListRecipe';
import { Button, ButtonText } from '~/components/ui/button';
import { useGlobalContext } from '~/context/GlobalProvider';
import { Ionicons } from '@expo/vector-icons';
import LazyImage from '~/components/LazyImage';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { session } = useGlobalContext();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [recipes, setRecipes] = useState<any>([]);
  const [likedRecipes, setLikedRecipes] = useState<any>([]);

  useFocusEffect(
    useCallback(() => {
      console.log('fetching');
      fetchProfile();
      fetchHighRatedRecipes();
    }, [])
  );

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*, recipe(*, recipe_reaction(rating.avg()))')
      .eq('id', id || session?.user.id)
      .single();
    if (error) {
      console.log('error', error);
    } else {
      setRecipes(
        [...data.recipe].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      if (data?.profile_image) {
        data.profile_image = data?.profile_image + '?time=' + new Date().getTime(); // Add timestamp to prevent caching
      }
      setProfile(data);
    }
  };

  const fetchHighRatedRecipes = async () => {
    const { data, error } = await supabase
      .from('recipe_reaction')
      .select('*, recipe(*, recipe_reaction(rating.avg()))')
      .eq('user_id', id || session?.user.id)
      .gte('rating', 4); // filter recipes with rating >= 4
    if (error) {
      console.log('error', error);
    } else {
      setLikedRecipes(data.map((item) => item.recipe));
    }
  };

  const [tab, setTab] = useState<'recipe' | 'liked'>('recipe');

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchProfile();
      fetchHighRatedRecipes();
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="px-7">
          <View className="h-16 flex-row items-center justify-center">
            <Text className="font-qs-bold text-2xl text-dark">@{profile?.username}</Text>
            {!id || session?.user.id === id ? (
              <View className="ml-auto">
                <TouchableOpacity activeOpacity={0.75} onPress={() => router.push('settings')}>
                  <Ionicons size={24} name="settings-outline" color={'rgb(42 48 81)'} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <View className="flex-row items-center justify-between">
            <LazyImage
              source={{ uri: profile?.profile_image }}
              className="h-24 w-24 rounded-full bg-outline-100"
            />

            <View className="flex-col items-center ">
              <Text className="font-qs-bold text-lg text-dark">{recipes.length}</Text>
              <Text className="font-qs-medium text-dark">recipe</Text>
            </View>
            <View className="flex-col items-center ">
              <Text className="font-qs-bold text-lg text-dark">0</Text>
              <Text className="font-qs-medium text-dark">followers</Text>
            </View>
            <View className="flex-col items-center ">
              <Text className="font-qs-bold text-lg text-dark">0</Text>
              <Text className="font-qs-medium text-dark">following</Text>
            </View>
          </View>
          <View className="my-4 flex-col">
            <Text className="font-qs-bold text-xl text-dark">{profile?.name}</Text>
            <Text className="-mt-1 font-qs-medium">{profile?.profession}</Text>
            <Text numberOfLines={4} className="my-2 font-qs-medium text-lg leading-6">
              {profile?.bio}
            </Text>
            <Button
              className="mt-3 h-10 w-1/2 rounded-lg bg-sky-500"
              onPress={() => {
                console.log('followed');
              }}>
              {/* {loading ? <ButtonSpinner color={'white'} /> : null} */}
              <ButtonText className="text-md font-medium">Follow</ButtonText>
            </Button>
          </View>
        </View>
        <View className="mx-7 my-4 flex-row justify-between border-b-2 border-outline-200 py-3">
          <View className="relative flex-1 items-center">
            {tab === 'recipe' ? (
              <>
                <Ionicons name="grid" size={24} color={'rgb(42 48 81)'} />
                <View style={{ height: 2 }} className="absolute -bottom-3.5 w-1/2 bg-dark"></View>
              </>
            ) : (
              <TouchableOpacity onPress={() => setTab('recipe')}>
                <Ionicons name="grid-outline" size={24} color={'rgb(42 48 81)'} />
              </TouchableOpacity>
            )}
          </View>
          <View className="relative flex-1 items-center">
            {tab === 'liked' ? (
              <>
                <Ionicons name="heart" size={24} color={'rgb(239 68 68)'} />
                <View
                  style={{ height: 2 }}
                  className="absolute -bottom-3.5 w-1/2 bg-red-500"></View>
              </>
            ) : (
              <TouchableOpacity onPress={() => setTab('liked')}>
                <Ionicons name="heart-outline" size={24} color={'rgb(42 48 81)'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {tab === 'recipe' ? (
          <ListRecipe recipes={recipes} />
        ) : (
          <ListRecipe recipes={likedRecipes} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
