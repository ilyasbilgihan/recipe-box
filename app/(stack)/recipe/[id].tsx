import React, { useCallback, useRef, useState } from 'react';
import { View, Text, Image, Dimensions, StatusBar, FlatList } from 'react-native';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RefreshControl, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import StarRating from 'react-native-star-rating-widget';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

import { editorCSS } from '~/utils/editorCSS';
import Comments from '~/components/Comments';
import LazyImage from '~/components/LazyImage';

const windowWidth = Dimensions.get('window').width;

const RecipeDetail = () => {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const timeout = useRef<any>(null);
  const [rating, setRating] = useState(0);
  const [initialRating, setInitialRating] = useState(0);
  const [recipeRatings, setRecipeRatings] = useState<any>([]);

  const { session, ifLight } = useGlobalContext();

  useFocusEffect(
    useCallback(() => {
      console.log('hey');
      // This will run when screen is `focused` or mounted.
      StatusBar.setHidden(true);

      fetchRecipe();
      checkBookmark();

      // This will run when screen is `blured` or unmounted.
      return () => {
        StatusBar.setHidden(false);
      };
    }, [])
  );

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from('recipe')
      .select(
        '*, profile(*), comment(*, profile(*)), recipe_category(category(name)), recipe_reaction(*), recipe_ingredient(id, amount, unit, ingredient(*))'
      )
      .eq('id', id)
      .single();

    if (error) {
      console.log(error);
    }

    if (data) {
      setRecipeRatings(data.recipe_reaction);
      let rated = data?.recipe_reaction?.find(
        (rating: { user_id: string | undefined }) => rating.user_id === session?.user.id
      );
      if (rated) {
        setRating(rated.rating);
      }
      setRecipe(data);
    }
  };

  const [height, setHeight] = useState<number>(0);

  const onWebViewMessage = (event: WebViewMessageEvent) => {
    console.log(event.nativeEvent);
    setHeight(+event.nativeEvent.data);
  };

  const checkBookmark = async () => {
    const { data, error } = await supabase
      .from('bookmark')
      .select('*')
      .eq('recipe_id', id)
      .eq('user_id', session?.user.id)
      .single();

    if (data) {
      setBookmarked(true);
    }
    return data;
  };
  const handleBookmark = async () => {
    if (loading) return;

    setLoading(true);
    const data = await checkBookmark();

    if (data) {
      // remove bookmarked
      const { error } = await supabase.from('bookmark').delete().eq('id', data.id);
      if (!error) {
        setBookmarked(false);
      }
    } else {
      // add bookmark
      const { error } = await supabase
        .from('bookmark')
        .insert({ user_id: session?.user.id, recipe_id: id });
      if (!error) {
        setBookmarked(true);
      }
    }

    setLoading(false);
  };

  const handleRating = async () => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      // update or insert rating
      setLoading(true);
      const { data, error } = await supabase
        .from('recipe_reaction')
        .select('*')
        .eq('recipe_id', id)
        .eq('user_id', session?.user.id)
        .single();

      console.log(data);
      if (data) {
        // delete rating
        const { error: deleteError } = await supabase
          .from('recipe_reaction')
          .delete()
          .eq('id', data.id);
      }

      const { error: addReactionError } = await supabase
        .from('recipe_reaction')
        .upsert({ user_id: session?.user.id, recipe_id: id, rating: rating });
      if (addReactionError) {
        setRating(initialRating);
      } else {
        setRecipeRatings([
          ...recipeRatings.filter((item: any) => item.user_id !== session?.user.id),
          { user_id: session?.user.id, rating: rating },
        ]);
      }
      setLoading(false);
    }, 1000);
  };

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(false);
    fetchRecipe();
    checkBookmark();
    setRefreshing(false);
  }, []);
  return (
    <>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <LazyImage
          background
          className="bg-warning-400"
          source={{ uri: recipe?.thumbnail }}
          style={{
            width: windowWidth,
            aspectRatio: 1,
            position: 'relative',
            overflow: 'hidden',
          }}>
          <View className="absolute left-0 top-0 w-full flex-row justify-between p-7">
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                router.back();
              }}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                size={22}
                name="chevron-back"
                color={ifLight('rgb(250 249 251)', 'rgb(228 230 255)')}
              />
            </TouchableOpacity>
            <View className="items-end gap-4">
              <View className="flex-row gap-4">
                {session?.user.id === recipe?.owner_id ? (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      router.push(`/edit-recipe/${recipe?.id}`);
                    }}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Ionicons name="create" size={24} color={'rgb(250 249 251)'} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleBookmark}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {bookmarked ? (
                    <Ionicons
                      name="bookmark"
                      size={24}
                      color={ifLight('rgb(250 249 251)', 'rgb(228 230 255)')}
                    />
                  ) : (
                    <Ionicons
                      name="bookmark-outline"
                      size={24}
                      color={ifLight('rgb(250 249 251)', 'rgb(228 230 255)')}
                    />
                  )}
                </TouchableOpacity>
              </View>
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  width: 48,
                  borderRadius: 24,
                  paddingVertical: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                }}>
                <Ionicons
                  name="time"
                  size={24}
                  color={ifLight('rgb(250 249 251)', 'rgb(228 230 255)')}
                />
                <View className="items-center">
                  <Text
                    style={{ color: ifLight('rgb(250 249 251)', 'rgb(228 230 255)') }}
                    className="font-qs-semibold">
                    {recipe?.duration}
                  </Text>
                  <Text
                    style={{ color: ifLight('rgb(250 249 251)', 'rgb(228 230 255)') }}
                    className="font-qs-medium">
                    min
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="absolute bottom-0 w-full">
            <View className="relative justify-center overflow-hidden px-7 pb-6 pt-5">
              <Image
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: windowWidth,
                  aspectRatio: 1,
                }}
                source={{ uri: recipe?.thumbnail }}
                blurRadius={20}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: windowWidth,
                  aspectRatio: 1,
                  backgroundColor: 'rgba(42, 48, 81, 0.5)',
                }}></View>
              <Text
                style={{ fontSize: 36, color: 'rgb(228 230 255)' }}
                className="font-qs-semibold">
                {recipe.name}
              </Text>
            </View>
          </View>
        </LazyImage>
        <View className=" gap-2 px-7 py-6">
          <View className="ml-auto flex-row items-end gap-1">
            <StarRating
              starStyle={{ marginLeft: -8 }}
              starSize={28}
              onRatingStart={() => setInitialRating(rating)}
              onRatingEnd={handleRating}
              color={ifLight('#FB954B', 'rgb(231 120 40)')}
              rating={rating}
              onChange={setRating}
            />
            <Text className="font-qs-semibold text-lg text-dark">
              {recipeRatings.length
                ? (
                    recipeRatings?.reduce(
                      (acc: any, rating: { rating: any }) => acc + rating.rating,
                      0
                    ) / recipeRatings?.length
                  ).toFixed(1)
                : '-'}
              <Text className="font-qs-medium text-sm"> ({recipeRatings?.length})</Text>
            </Text>
          </View>

          {recipe.profile ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push(`/profile/${recipe.profile?.id}`)}>
              <View className="w-2/3 flex-row items-center gap-2">
                <Image
                  source={
                    recipe.profile?.profile_image
                      ? { uri: recipe.profile.profile_image }
                      : require('~/assets/images/no-image.png')
                  }
                  className="h-12 w-12 rounded-full"
                />
                <View>
                  <Text className="font-qs-bold text-lg text-dark">
                    {recipe.profile?.name || '@' + recipe.profile?.username}
                  </Text>
                  {recipe.profile?.profession ? (
                    <Text className="-mt-1 font-qs-medium text-sm text-dark">
                      {recipe.profile?.profession}
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="w-1/2 flex-row items-center gap-2">
              <View
                style={{ backgroundColor: ifLight('rgb(221 220 219)', 'rgb(52 54 79)') }}
                className="h-12 w-12 rounded-full "></View>
              <View className="gap-1">
                <View
                  style={{ backgroundColor: ifLight('rgb(221 220 219)', 'rgb(52 54 79)') }}
                  className="h-4 w-20 rounded-lg "></View>
                <View
                  style={{ backgroundColor: ifLight('rgb(221 220 219)', 'rgb(52 54 79)') }}
                  className="h-3 w-14 rounded-lg "></View>
              </View>
            </View>
          )}
        </View>
        <View className="mx-7 mt-4">
          <View className="flex-row items-center gap-2 ">
            <Ionicons
              name="pricetags-outline"
              size={24}
              color={ifLight('rgb(42 48 81)', 'rgb(250 249 251)')}
            />
            <Text className="font-qs-semibold text-2xl text-dark">
              Ingredients{' '}
              <Text className="font-qs text-lg">({recipe?.recipe_ingredient?.length})</Text>
            </Text>
          </View>
          <FlatList
            data={recipe?.recipe_ingredient}
            className="py-4"
            renderItem={({ item }) => (
              <View
                className="flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-300 px-2"
                style={{ width: (windowWidth - 72) / 2.5, paddingVertical: 12 }}
                key={item.id}>
                <View>
                  <Image source={{ uri: item.ingredient.image }} className="aspect-square w-1/2" />
                </View>
                <View className="w-full items-center">
                  <Text className="text-center font-qs-semibold text-lg leading-5 text-dark">
                    {item.ingredient.name}
                  </Text>
                  <Text className="font-qs-medium text-dark">
                    {item.amount} {item.unit}
                  </Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View className="w-4" />}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => 'category-' + item.id}
            /* extraData={selectedId}  // rerender when selectedId changes */
          />
        </View>
        <View className="ml-7 mt-4 flex-row items-center gap-2">
          <Ionicons
            name="footsteps-outline"
            size={24}
            color={ifLight('rgb(42 48 81)', 'rgb(250 249 251)')}
          />
          <Text className="font-qs-semibold text-2xl text-dark">Instructions</Text>
        </View>
        <View>
          {recipe.instructions ? (
            <WebView
              originWhitelist={['*']}
              style={{ height }}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight)"
              onMessage={onWebViewMessage}
              source={{
                html: `<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head><body class="${ifLight('light', 'dark')}">${recipe?.instructions}<style>${editorCSS} *{user-select:none}</style></body>`,
              }}
            />
          ) : null}
        </View>
        {recipe?.id ? (
          <View className="mt-4 gap-4 px-7 pb-24">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="chatbubbles-outline"
                size={24}
                color={ifLight('rgb(42 48 81)', 'rgb(250 249 251)')}
              />
              <Text className="font-qs-semibold text-2xl text-dark">Comments</Text>
            </View>
            <Comments recipeId={recipe?.id} />
          </View>
        ) : null}
      </ScrollView>
    </>
  );
};

export default RecipeDetail;
