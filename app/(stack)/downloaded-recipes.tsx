import { View, Text, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { useGlobalContext } from '~/context/GlobalProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import ListRecipe from '~/components/ListRecipe';
import { useTranslation } from 'react-i18next';
import { getItem, setItem } from '~/core/storage';
import Pagination from '@cherry-soft/react-native-basic-pagination';

const LIMIT = 6;

const DownloadedRecipes = () => {
  const { ifLight } = useGlobalContext();
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<any>([]);
  const [items, setItems] = useState<any>([]);
  const [page, setPage] = useState(1);

  useFocusEffect(
    useCallback(() => {
      fetchDownloaded();
    }, [])
  );

  const fetchDownloaded = async () => {
    const storageItems = await getItem('bookmarks');
    setItems(storageItems);
  };

  useEffect(() => {
    if (items?.length > 0) {
      fetchPage(1);
    }
  }, [items]);

  const fetchPage = async (targetPage: number) => {
    let from = (targetPage - 1) * LIMIT;
    let to = from + LIMIT - 1;

    setRecipes(items.slice(from, to));
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="h-16 flex-row items-center justify-between px-7">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}>
            <Ionicons
              size={24}
              name="chevron-back"
              color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
            />
          </TouchableOpacity>
          <Text className="font-qs-bold text-2xl text-dark">{t('downloaded_recipes')}</Text>
          <View className="h-6 w-6"></View>
        </View>
        <View className="px-7">
          {recipes!?.length > 0 && items?.length > recipes?.length ? (
            <Pagination
              totalItems={items?.length}
              pageSize={LIMIT}
              currentPage={page}
              btnStyle={{
                borderColor: ifLight('rgba(52,54,79,0.2)', 'transparent'),
                borderRadius: 8,
                backgroundColor: ifLight('rgb(255 255 255)', 'rgb(52 54 79)'),
              }}
              activeBtnStyle={{
                backgroundColor: ifLight('rgb(251 149 75)', 'rgb(231 120 40)'),
                borderColor: 'transparent',
              }}
              textStyle={{
                fontFamily: 'Quicksand Medium',
                color: ifLight('rgb(42 48 81)', 'rgb(238 240 255)'),
              }}
              activeTextStyle={{
                fontFamily: 'Quicksand Medium',
                color: 'rgb(255 249 245)',
              }}
              onPageChange={(page) => {
                setPage(page);
                fetchPage(page);
              }}
            />
          ) : null}
        </View>
        <ListRecipe recipes={recipes!} notFoundText={t('not_found_downloaded')} downloaded={true} />
        <View className="px-7">
          {recipes!?.length >= 5 && items?.length > recipes?.length ? (
            <Pagination
              totalItems={items?.length}
              pageSize={LIMIT}
              currentPage={page}
              btnStyle={{
                borderColor: ifLight('rgba(52,54,79,0.2)', 'transparent'),
                borderRadius: 8,
                backgroundColor: ifLight('rgb(255 255 255)', 'rgb(52 54 79)'),
              }}
              activeBtnStyle={{
                backgroundColor: ifLight('rgb(251 149 75)', 'rgb(231 120 40)'),
                borderColor: 'transparent',
              }}
              textStyle={{
                fontFamily: 'Quicksand Medium',
                color: ifLight('rgb(42 48 81)', 'rgb(238 240 255)'),
              }}
              activeTextStyle={{
                fontFamily: 'Quicksand Medium',
                color: 'rgb(255 249 245)',
              }}
              onPageChange={(page) => {
                setPage(page);
                fetchPage(page);
              }}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DownloadedRecipes;
