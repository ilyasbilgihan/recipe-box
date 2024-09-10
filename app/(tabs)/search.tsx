import { View, Text, TouchableOpacity } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '~/context/GlobalProvider';
import { BottomSheetModal, BottomSheetFooter } from '@gorhom/bottom-sheet';
import BottomSheet from '~/components/BottomSheet';
import { useTranslation } from 'react-i18next';
import { Input, InputField } from '~/components/ui/input';
import Picker from '~/components/Picker';
import IngredientPicker from '~/components/IngredientPicker';
import { FormControl, FormControlLabel, FormControlLabelText } from '~/components/ui/form-control';
import { Button, ButtonSpinner, ButtonText } from '~/components/ui/button';
import ListRecipe from '~/components/ListRecipe';
import Pagination from '@cherry-soft/react-native-basic-pagination';

const LIMIT = 6;

const Search = () => {
  const { ifLight } = useGlobalContext();
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<any[] | null>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [duration, setDuration] = useState('60');
  const [page, setPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchIngredients();
    }, [])
  );

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .order('id', { ascending: true });

    if (data) {
      setCategories(data);
    }
  };

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from('ingredient')
      .select('*')
      .order('id', { ascending: true });

    if (data) {
      setIngredients(data);
    }
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSearch = async (targetPage: number) => {
    let categoryString = categories.map((cat) => cat.id).join(',');
    let ingredientString = ingredients.map((ing) => ing.id).join(',');
    if (selectedCategories.length > 0) {
      categoryString = selectedCategories.map((cat) => cat.id).join(',');
    }
    if (selectedIngredients.length > 0) {
      ingredientString = selectedIngredients.map((ing) => ing.id).join(',');
    }

    let term = searchTerm.trim();
    let queryString = term.split(' ').join(':*|');

    console.log('query string', queryString);
    console.log('category string', categoryString);
    console.log('ingredient string', ingredientString);

    let query = supabase
      .from('recipe')
      .select(
        '*, recipe_ingredient!inner(ingredient_id), recipe_category!inner(category_id), recipe_reaction(rating.avg())',
        { count: 'exact' }
      )
      .is('alternative_of', null)
      .filter('recipe_category.category_id', 'in', `(${categoryString})`)
      .filter('recipe_ingredient.ingredient_id', 'in', `(${ingredientString})`)
      .lte('duration', duration)
      .order('created_at', { ascending: true });

    let from = (targetPage - 1) * LIMIT;
    let to = from + LIMIT - 1;

    if (queryString) {
      const { count, data, error } = await query
        .textSearch('fts', queryString + ':*')
        .range(from, to);

      setItemCount(count!);
      setRecipes(data);
    } else {
      const { count, data, error } = await query.range(from, to);
      setItemCount(count!);
      setRecipes(data);
    }
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
          <Text className="font-qs-bold text-2xl text-dark">{t('search_recipe')}</Text>
          <TouchableOpacity activeOpacity={0.75} onPress={handlePresentModalPress}>
            <View className="h-10 w-10 items-center justify-center rounded-md border border-background-300 bg-back dark:border-transparent">
              <Ionicons
                name="options-outline"
                size={20}
                color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View className="px-7">
          {recipes!?.length > 0 && itemCount > recipes!?.length ? (
            <Pagination
              totalItems={itemCount}
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
                handleSearch(page);
              }}
            />
          ) : null}
        </View>
        <ListRecipe recipes={recipes!} notFoundText={t('not_found_search')} />
        <View className="px-7">
          {recipes!?.length >= 5 && itemCount > recipes!?.length ? (
            <Pagination
              totalItems={itemCount}
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
                handleSearch(page);
              }}
            />
          ) : null}
        </View>
      </ScrollView>
      <BottomSheet ref={bottomSheetModalRef} snapPoints={['33%', '66%']}>
        <View className="flex gap-4 ">
          <View className="my-4 flex-row items-center justify-between gap-3 px-7">
            <Text
              style={{ color: ifLight('rgb(42 48 81)', 'rgb(238 240 255)') }}
              className="flex-1 font-qs-bold text-2xl">
              {t('filter_search')}
            </Text>
            <Button
              className="h-11 rounded-xl bg-info-400"
              onPress={() => {
                handleSearch(1);
              }}>
              <ButtonText className="text-md font-medium text-info-50">{t('search')}</ButtonText>
            </Button>
          </View>
          <ScrollView style={{ marginBottom: 196 }}>
            <View className="gap-3 px-7">
              <FormControl>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText>{t('search_query')}</FormControlLabelText>
                </FormControlLabel>
                <Input className="flex h-10 flex-1 flex-row items-center justify-between rounded">
                  <InputField
                    className="flex-1"
                    defaultValue={searchTerm}
                    onChange={(e) => setSearchTerm(e.nativeEvent.text)}
                    placeholder={t('recipe_name_placeholder')}
                  />
                  <View className="flex h-10 w-10 items-center justify-center">
                    <Ionicons
                      name="search-sharp"
                      size={16}
                      color={ifLight('rgb(140 140 140)', 'rgb(163 163 163)')}
                    />
                  </View>
                </Input>
              </FormControl>
              <FormControl>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText>{t('recipe_duration')}</FormControlLabelText>
                </FormControlLabel>
                <Input className="flex-row items-center">
                  <InputField
                    keyboardType="numeric"
                    defaultValue={duration}
                    onChange={(e) => setDuration(e.nativeEvent.text)}
                    placeholder="0"
                  />
                  <View style={{ paddingRight: 8 }}>
                    <Text className="font-qs-medium text-sm text-typography-500">
                      {t('minute_long')}
                    </Text>
                  </View>
                </Input>
              </FormControl>
              <Picker
                items={categories}
                label={t('category')}
                noItemText={t('no_category')}
                selectedItems={selectedCategories}
                setSelectedItems={setSelectedCategories}
              />
              <Picker
                items={ingredients}
                label={t('ingredients')}
                noItemText={t('no_ingredients')}
                selectedItems={selectedIngredients}
                setSelectedItems={setSelectedIngredients}
              />
            </View>
          </ScrollView>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default Search;
