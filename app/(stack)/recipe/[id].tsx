import {
  View,
  Text,
  Image,
  Dimensions,
  ImageBackground,
  StatusBar,
  RefreshControl,
  FlatList,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { supabase } from '~/utils/supabase';
import { TabBarIcon } from '~/components/TabBarIcon';
import { useFocusEffect } from 'expo-router';

import WebView, { WebViewMessageEvent } from 'react-native-webview';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

import { editorCSS } from '~/utils/editorCSS';
import { useGlobalContext } from '~/context/GlobalProvider';
import StarRating from 'react-native-star-rating-widget';

const User = () => {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const timeout = useRef<any>(null);
  const [rating, setRating] = useState(0);
  const [initialRating, setInitialRating] = useState(0);
  const [recipeRatings, setRecipeRatings] = useState<any>([]);

  const { session } = useGlobalContext();

  useEffect(() => {
    fetchRecipe();
    checkBookmark();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('hey');
      // This will run when screen is `focused` or mounted.
      StatusBar.setHidden(true);

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
        '*, profile(*), recipe_category(category(name)), recipe_reaction(*), recipe_ingredient(id, amount, unit, ingredient(*))'
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
  return (
    <>
      <ScrollView>
        <ImageBackground
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
                router.replace('/');
              }}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TabBarIcon name="chevron-left" color={'rgb(250 249 251)'} />
            </TouchableOpacity>
            <View className="gap-4">
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  if (!loading) {
                    handleBookmark();
                  }
                }}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {bookmarked ? (
                  <TabBarIcon name="bookmark" size={24} color={'rgb(250 249 251)'} />
                ) : (
                  <TabBarIcon name="bookmark-o" size={24} color={'rgb(250 249 251)'} />
                )}
              </TouchableOpacity>
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
                <TabBarIcon name="clock-o" size={24} color={'rgb(250 249 251)'} />
                <View className="items-center">
                  <Text className=" font-qs-semibold text-light">30</Text>
                  <Text className=" font-qs-medium text-light">min</Text>
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
              <Text style={{ fontSize: 36 }} className="font-qs-semibold text-light">
                {recipe.name}
              </Text>
            </View>
          </View>
        </ImageBackground>
        <View className="flex-row items-center justify-end gap-4 px-7 py-6">
          <Text className="font-qs-medium">
            {recipeRatings.length
              ? (
                  recipeRatings?.reduce(
                    (acc: any, rating: { rating: any }) => acc + rating.rating,
                    0
                  ) / recipeRatings?.length
                ).toFixed(1)
              : '-'}{' '}
            ({recipeRatings?.length})
          </Text>
          <StarRating
            starStyle={{ marginLeft: -6 }}
            starSize={28}
            onRatingStart={() => setInitialRating(rating)}
            onRatingEnd={handleRating}
            color={'#FB954B'}
            rating={rating}
            onChange={setRating}
          />
        </View>
        <View className="mx-7">
          <Text className="font-qs-semibold text-2xl text-dark">
            Ingredients{' '}
            <Text className="font-qs text-lg">({recipe?.recipe_ingredient?.length})</Text>
          </Text>
          <FlatList
            data={recipe?.recipe_ingredient}
            className="py-4"
            renderItem={({ item }) => (
              <View
                className="flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-400 px-2"
                style={{ width: (windowWidth - 72) / 2.5, height: (windowWidth - 72) / 2.5 }}
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
        <Text className="ml-7 font-qs-semibold text-2xl text-dark">Instructions</Text>
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
                html: `<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head><body class="gray">${recipe?.instructions}<style>${editorCSS}</style></body>`,
              }}
            />
          ) : null}
        </View>
      </ScrollView>
    </>
  );
};

export default User;
