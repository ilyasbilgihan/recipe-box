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
import FollowListTrigger from '~/components/FollowList';

type Follow =
  | {
      id: any;
      name: any;
      username: any;
      profile_image: any;
    }[]
  | undefined;

const Profile = () => {
  const { session, ifLight } = useGlobalContext();
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [recipes, setRecipes] = useState<any>([]);
  const [likedRecipes, setLikedRecipes] = useState<any>([]);
  const [draftRecipes, setDraftRecipes] = useState<any>([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [follow, setFollow] = useState<{ followers: Follow; following: Follow }>({
    followers: undefined,
    following: undefined,
  });

  useFocusEffect(
    useCallback(() => {
      console.log('fetching');
      fetchProfile();
      fetchHighRatedRecipes();
      fetchBookmarks();
      checkFollow();
    }, [])
  );

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*, recipe(*, recipe_reaction(rating.avg()))')
      .eq('id', id || session?.user.id)
      .order('created_at', { ascending: false, referencedTable: 'recipe' })
      .single();
    if (error) {
      console.log('error', error);
    } else {
      let all = [...data.recipe];
      setDraftRecipes(all.filter((item) => item.status != 'confirmed'));
      setRecipes(all.filter((item) => item.status == 'confirmed'));

      if (data?.profile_image) {
        data.profile_image = data?.profile_image;
      }
      setProfile(data);
    }
  };

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmark')
      .select('*, recipe(*, recipe_reaction(rating.avg()))')
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookmarkedRecipes([...data].map((item) => item.recipe));
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

  const [tab, setTab] = useState<'recipe' | 'liked' | 'draft' | 'bookmark'>('recipe');

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProfile();
    fetchHighRatedRecipes();
    setRefreshing(false);
    checkFollow();
  }, []);

  const checkFollow = async () => {
    const { data: follower_sb } = await supabase
      .from('follow')
      .select(
        'follower:profile!follower_id(id, name, username, profile_image, followers:follow!following_id(follower_id))'
      )
      .eq('following_id', id || session?.user.id)
      .eq('follower.followers.follower_id', session?.user.id);

    let follower_data = follower_sb?.map(
      (item) => (Array.isArray(item.follower) ? item.follower[0] : item.follower) // some weird typescript error
    );
    const { data: following_sb } = await supabase
      .from('follow')
      .select(
        'following:profile!following_id(id, name, username, profile_image, followers:follow!following_id(follower_id))'
      )
      .eq('follower_id', id || session?.user.id)
      .eq('following.followers.follower_id', session?.user.id);

    let following_data = following_sb?.map(
      (item) => (Array.isArray(item.following) ? item.following[0] : item.following) // some weird typescript error
    );

    setFollow({ followers: follower_data, following: following_data });
  };

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);
    let isFollowing = follow.followers?.find((follower) => follower.id === session?.user.id);
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
                  <Ionicons
                    size={24}
                    name="settings-outline"
                    color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                  />
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
            <FollowListTrigger list={follow.followers} checkFollow={checkFollow} title="Followers">
              <View className="flex-col items-center ">
                <Text className="font-qs-bold text-lg text-dark">{follow.followers?.length}</Text>
                <Text className="font-qs-medium text-dark">followers</Text>
              </View>
            </FollowListTrigger>
            <FollowListTrigger list={follow.following} checkFollow={checkFollow} title="Following">
              <View className="flex-col items-center ">
                <Text className="font-qs-bold text-lg text-dark">{follow.following?.length}</Text>
                <Text className="font-qs-medium text-dark">following</Text>
              </View>
            </FollowListTrigger>
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
              follow.followers?.find((follower) => follower.id === session?.user.id) ? (
                <Button
                  className="mt-3 h-10 w-1/2 rounded-lg border border-info-500 bg-light "
                  onPress={handleFollow}>
                  <ButtonText className="text-md font-medium text-info-500">Following</ButtonText>
                </Button>
              ) : (
                <Button className="mt-3 h-10 w-1/2 rounded-lg bg-info-500" onPress={handleFollow}>
                  <ButtonText className="text-md font-medium">Follow</ButtonText>
                </Button>
              )
            ) : null}
          </View>
        </View>
        <View
          className={`mx-7 mb-8 mt-4 flex-row justify-between border-b-2 pb-3 pt-2 ${ifLight('border-outline-200', 'border-back')}`}>
          <View className="relative flex-1 items-center">
            {tab === 'recipe' ? (
              <>
                <Ionicons
                  name="grid"
                  size={24}
                  color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                />
                <View style={{ height: 2 }} className="absolute -bottom-3.5 w-1/2 bg-dark"></View>
              </>
            ) : (
              <TouchableOpacity onPress={() => setTab('recipe')}>
                <Ionicons
                  name="grid-outline"
                  size={24}
                  color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                />
              </TouchableOpacity>
            )}
          </View>
          <View className="relative flex-1 items-center">
            {tab === 'liked' ? (
              <>
                <Ionicons
                  name="heart"
                  size={24}
                  color={ifLight('rgb(239 68 68)', 'rgb(230 53 53)')}
                />
                <View
                  style={{ height: 2 }}
                  className="absolute -bottom-3.5 w-1/2 bg-error-500"></View>
              </>
            ) : (
              <TouchableOpacity onPress={() => setTab('liked')}>
                <Ionicons
                  name="heart-outline"
                  size={24}
                  color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                />
              </TouchableOpacity>
            )}
          </View>
          {!id || session?.user.id === id ? (
            <View className="relative flex-1 items-center">
              {tab === 'bookmark' ? (
                <>
                  <Ionicons
                    name="bookmark"
                    size={24}
                    color={ifLight('rgb(251 149 75)', 'rgb(231 120 40)')}
                  />
                  <View
                    style={{ height: 2 }}
                    className="absolute -bottom-3.5 w-1/2 bg-warning-400"></View>
                </>
              ) : (
                <TouchableOpacity onPress={() => setTab('bookmark')}>
                  <Ionicons
                    name="bookmark-outline"
                    size={24}
                    color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          {!id || session?.user.id === id ? (
            <View className="relative flex-1 items-center">
              {tab === 'draft' ? (
                <>
                  <Ionicons
                    name="receipt"
                    size={24}
                    color={ifLight('rgb(13 166 242)', 'rgb(50 180 244)')}
                  />
                  <View
                    style={{ height: 2 }}
                    className="absolute -bottom-3.5 w-1/2 bg-info-500"></View>
                </>
              ) : (
                <TouchableOpacity onPress={() => setTab('draft')}>
                  <Ionicons
                    name="receipt-outline"
                    size={24}
                    color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>

        {
          {
            recipe: (
              <>
                <Text className="mb-4 px-7 font-qs-bold text-2xl text-dark">
                  Shared ({recipes.length})
                </Text>
                <ListRecipe recipes={recipes} />
              </>
            ),
            liked: (
              <>
                <Text className="mb-4 px-7 font-qs-bold text-2xl text-dark">
                  Liked ({likedRecipes.length})
                </Text>
                <ListRecipe recipes={likedRecipes} />
              </>
            ),
            bookmark: (
              <>
                <Text className="mb-4 px-7 font-qs-bold text-2xl text-dark">
                  Bookmarked ({bookmarkedRecipes.length})
                </Text>
                <ListRecipe recipes={bookmarkedRecipes} />
              </>
            ),
            draft: (
              <>
                <Text className="mb-4 px-7 font-qs-bold text-2xl text-dark">
                  Draft ({draftRecipes.length})
                </Text>
                <ListRecipe recipes={draftRecipes} />
              </>
            ),
          }[tab]
        }
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
