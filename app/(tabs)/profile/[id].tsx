import { View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { supabase } from '~/utils/supabase';
import ListRecipe from '~/components/ListRecipe';
import { Button, ButtonSpinner, ButtonText } from '~/components/ui/button';

const User = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*, recipe(*, recipe_reaction(rating.avg()))')
      .eq('id', id)
      .single();
    if (error) {
      console.log('error', error);
    } else {
      console.log('data', data);
      navigation.setOptions({ title: '@' + data.username });
      setProfile(data);
    }
  };

  return (
    <ScrollView>
      <View className="px-7">
        <View className="flex-row items-center justify-between">
          <Image source={{ uri: profile?.profile_image }} className="h-24 w-24 rounded-full" />

          <View className="flex-col items-center ">
            <Text className="font-qs-bold text-lg text-dark">0</Text>
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
        <Text className="my-4 font-qs-semibold text-2xl text-dark">Recipes</Text>
        {/* TODO: Tab view*/}
      </View>
      <ListRecipe recipes={profile?.recipe} />
    </ScrollView>
  );
};

export default User;
