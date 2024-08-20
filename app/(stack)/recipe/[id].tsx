import {
  View,
  Text,
  Image,
  Dimensions,
  ImageBackground,
  StatusBar,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { supabase } from '~/utils/supabase';
import { TabBarIcon } from '~/components/TabBarIcon';
import { useFocusEffect } from 'expo-router';

import WebView, { WebViewMessageEvent } from 'react-native-webview';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

import { editorCSS } from '~/utils/editorCSS';

const User = () => {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<any>({});

  useEffect(() => {
    fetchRecipe();
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
      setRecipe(data);
    }
  };

  const [height, setHeight] = useState<number>(0);

  const onWebViewMessage = (event: WebViewMessageEvent) => {
    console.log(event.nativeEvent);
    setHeight(+event.nativeEvent.data);
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
          <View className="absolute left-7 top-7">
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
        <View className="flex-row justify-between px-7 py-6">
          <View className="flex-row items-center gap-2">
            <TabBarIcon name="clock-o" size={32} color={'rgb(42, 48, 81)'} />
            <Text className="font-qs-medium">{recipe.duration} minutes</Text>
          </View>
          <View className="flex-row gap-4">
            <TabBarIcon name="heart-o" size={32} color={'rgb(42, 48, 81)'} />
            <TabBarIcon name="bookmark-o" size={32} color={'rgb(42, 48, 81)'} />
          </View>
        </View>
        <View className="px-7">
          <Text className="font-qs-semibold text-2xl text-dark">Ingredients</Text>
          <View className="w-full flex-row flex-wrap gap-3 py-3">
            {recipe?.recipe_ingredient?.map((item: any) => (
              <View
                className="flex-col rounded-2xl bg-warning-50 shadow-sm"
                style={{ width: (windowWidth - 72) / 3, height: (windowWidth - 72) / 3 }}
                key={item.id}>
                <Text className="font-qs-medium text-dark">
                  {item.ingredient.name} - {item.amount} {item.unit}{' '}
                </Text>
              </View>
            ))}
          </View>
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
