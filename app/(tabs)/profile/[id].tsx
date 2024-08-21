import { View, Text, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { supabase } from '~/utils/supabase';
import ListRecipe from '~/components/ListRecipe';
import { Button, ButtonText } from '~/components/ui/button';
import { useGlobalContext } from '~/context/GlobalProvider';
import { Ionicons } from '@expo/vector-icons';

const User = () => {
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
      navigation.setOptions({ title: '@' + data.username });
      setRecipes(
        [...data.recipe].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
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

  return (
    <ScrollView>
      <View className="px-7">
        <View className="flex-row items-center justify-between">
          <Image source={{ uri: profile?.profile_image }} className="h-24 w-24 rounded-full" />

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
              <View style={{ height: 2 }} className="absolute -bottom-3.5 w-1/2 bg-red-500"></View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setTab('liked')}>
              <Ionicons name="heart-outline" size={24} color={'rgb(42 48 81)'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {tab === 'recipe' ? <ListRecipe recipes={recipes} /> : <ListRecipe recipes={likedRecipes} />}
    </ScrollView>
  );
};

export default User;
