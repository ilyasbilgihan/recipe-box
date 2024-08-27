import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

import ListRecipe from '~/components/ListRecipe';
import { Button, ButtonText } from '~/components/ui/button';
import LazyImage from '~/components/LazyImage';

type Follow = {
  follower_id: string;
  following_id: string;
};

const Profile = () => {
  const { session } = useGlobalContext();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [recipes, setRecipes] = useState<any>([]);
  const [likedRecipes, setLikedRecipes] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [follow, setFollow] = useState<{ followers: Follow[]; following: Follow[] }>({
    followers: [],
    following: [],
  });

  useFocusEffect(
    useCallback(() => {
      console.log('fetching');
      fetchProfile();
      fetchHighRatedRecipes();
      checkFollow();
    }, [])
  );

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*, recipe(*, recipe_reaction(rating.avg()))')
      .eq('recipe.status', 'confirmed') // unconfirmed recipes will be listing another tab
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
        data.profile_image = data?.profile_image;
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
    fetchProfile();
    fetchHighRatedRecipes();
    setRefreshing(false);
    checkFollow();
  }, []);

  const checkFollow = async () => {
    const { data: follower_data } = await supabase
      .from('follow')
      .select('*')
      .eq('following_id', id || session?.user.id);

    const { data: following_data } = await supabase
      .from('follow')
      .select('*')
      .eq('follower_id', id || session?.user.id);

    setFollow({ followers: follower_data!, following: following_data! });
  };

  const handleFollow = async () => {
    if (!loading) {
      setLoading(true);
      let isFollowing = follow.followers?.find(
        (follower) => follower.follower_id === session?.user.id
      );
      if (isFollowing) {
        // remove follow
        const { error } = await supabase
          .from('follow')
          .delete()
          .eq('follower_id', session?.user.id)
          .eq('following_id', id);
      } else {
        // add follow
        const { error } = await supabase
          .from('follow')
          .insert({ follower_id: session?.user.id, following_id: id });
      }

      checkFollow();
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="px-7">
          <View className="h-16 flex-row items-center justify-center">
            <Text className="font-qs-bold text-2xl text-dark">@{profile?.username}</Text>
            {!id || session?.user.id === id ? (
              <View className="ml-auto">
                <TouchableOpacity activeOpacity={0.75} onPress={() => router.push('/settings')}>
                  <Ionicons size={24} name="settings-outline" color={'rgb(42 48 81)'} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <View className="flex-row items-center justify-between">
            <LazyImage
              source={
                profile?.profile_image
                  ? { uri: profile.profile_image }
                  : require('~/assets/images/no-image.png')
              }
              className="h-24 w-24 rounded-full bg-outline-100"
            />

            <View className="flex-col items-center ">
              <Text className="font-qs-bold text-lg text-dark">{recipes.length}</Text>
              <Text className="font-qs-medium text-dark">recipes</Text>
            </View>
            <View className="flex-col items-center ">
              <Text className="font-qs-bold text-lg text-dark">{follow.followers?.length}</Text>
              <Text className="font-qs-medium text-dark">followers</Text>
            </View>
            <View className="flex-col items-center ">
              <Text className="font-qs-bold text-lg text-dark">{follow.following?.length}</Text>
              <Text className="font-qs-medium text-dark">following</Text>
            </View>
          </View>
          <View className="my-4 flex-col">
            {profile?.name && (
              <Text className="font-qs-bold text-xl text-dark">{profile?.name}</Text>
            )}
            {profile?.name && <Text className="-mt-1 font-qs-medium">{profile?.profession}</Text>}
            {profile?.bio && (
              <Text numberOfLines={4} className="my-2 font-qs-medium text-lg leading-6">
                {profile?.bio}
              </Text>
            )}
            {id && id !== session?.user.id ? (
              follow.followers?.find((follower) => follower.follower_id === session?.user.id) ? (
                <Button
                  className="mt-3 h-10 w-1/2 rounded-lg border border-sky-500 bg-light "
                  onPress={handleFollow}>
                  <ButtonText className="text-md font-medium text-sky-500">Following</ButtonText>
                </Button>
              ) : (
                <Button className="mt-3 h-10 w-1/2 rounded-lg bg-sky-500" onPress={handleFollow}>
                  <ButtonText className="text-md font-medium">Follow</ButtonText>
                </Button>
              )
            ) : null}
          </View>
        </View>
        <View className="mx-7 my-4 flex-row justify-between border-b-2 border-outline-200 pb-3 pt-2">
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
