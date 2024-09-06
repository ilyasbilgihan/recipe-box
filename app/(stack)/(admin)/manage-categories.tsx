import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetFooter } from '@gorhom/bottom-sheet';
import BottomSheet from '~/components/BottomSheet';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import { Button, ButtonSpinner, ButtonText } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { FormControl, FormControlLabel, FormControlLabelText } from '~/components/ui/form-control';
import { Input, InputField } from '~/components/ui/input';
import useCustomToast from '~/components/useCustomToast';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter } from '~/components/ui/modal';
import { useTranslation } from 'react-i18next';

const ManageCategories = () => {
  const { t } = useTranslation();
  const toast = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any>([]);
  const [category, setCategory] = useState<any>();
  const [recipeCategoriesToRemove, setRecipeCategoriesToRemove] = useState<any>([]);
  const [categoryName, setCategoryName] = useState('');
  const [modal, setModal] = useState(false);

  const { ifLight } = useGlobalContext();
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category')
      .select('*, recipes:recipe_category(id, recipe(id,name,thumbnail))')
      .order('special', { ascending: false })
      .order('id', { ascending: true });
    if (data) {
      setCategories(data);
    }
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleRemoveRecipeCategory = async (id: any) => {
    setCategory({ ...category, recipes: category.recipes.filter((item: any) => item.id !== id) });
    setRecipeCategoriesToRemove([...recipeCategoriesToRemove, id]);
  };

  const handleUpdateCategory = async () => {
    if (!category?.name) {
      toast.error('Category name is required');
      return;
    }
    if (!loading) {
      setLoading(true);
      let err: any = null;
      const { error } = await supabase
        .from('category')
        .update({
          name: category?.name,
          special: category?.special,
          selectable: category?.selectable,
        })
        .eq('id', category?.id);
      err = error;

      if (recipeCategoriesToRemove.length > 0) {
        const { error: recipeCategoryError } = await supabase
          .from('recipe_category')
          .delete()
          .in('id', recipeCategoriesToRemove);
        err = recipeCategoryError;
      }

      if (!err) {
        fetchCategories();
        toast.success('Category updated successfully');
        bottomSheetModalRef.current?.close();
      } else {
        console.log(err);
        toast.error('Something went wrong');
      }

      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    toast.confirm({
      title: t('dynamic_delete_confirm', { item: 'category' }),
      message: category?.name,
      icon: <Ionicons name="trash-outline" size={20} />,
      handler: async () => {
        const { error } = await supabase.from('category').delete().eq('id', category?.id);
        if (!error) {
          fetchCategories();
          toast.success('Category deleted successfully');
          bottomSheetModalRef.current?.close();
        } else {
          toast.error('Something went wrong');
        }
      },
    });
  };

  const handleCategoryCreate = async () => {
    let catToAdd = categoryName.trim();
    if (!catToAdd) {
      toast.error('Category name is required');
      return;
    }
    if (!loading) {
      setLoading(true);
      const { error } = await supabase.from('category').insert({ name: catToAdd }).select();

      if (!error) {
        fetchCategories();
        toast.success('Category created successfully');
        setModal(false);
      } else {
        toast.error('Something went wrong. ' + error.message);
      }

      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="w-full flex-1 px-7">
          <View className="h-16 flex-row items-center justify-between">
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
            <Text className="font-qs-bold text-2xl text-dark">{t('categories')}</Text>
            <TouchableOpacity
              onPress={() => {
                setCategoryName('');
                setModal(true);
              }}>
              <Ionicons
                size={24}
                name="add-outline"
                color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
              />
            </TouchableOpacity>
          </View>
          <View className="gap-3 pb-12">
            {categories.length > 0
              ? categories.map((category: any) => (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      setCategory(category);
                      setRecipeCategoriesToRemove([]);
                      handlePresentModalPress();
                    }}
                    key={category?.id}
                    className="relative h-12 flex-row items-center justify-between rounded-xl bg-back pl-4 shadow-soft-5">
                    <Text className="font-qs-semibold text-dark">{category.name}</Text>
                    <View className="absolute right-1 flex h-10 min-w-10 flex-row items-center justify-center gap-2 rounded-lg bg-light px-3">
                      <Text className="font-qs-medium text-dark">
                        {category.recipes.length || '0'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              : null}
          </View>
        </View>
      </ScrollView>
      <BottomSheet
        footerComponent={(props) => (
          <BottomSheetFooter {...props} bottomInset={20} style={{ paddingHorizontal: 28 }}>
            <Button
              className="w-full rounded-md bg-error-500"
              onPress={() => {
                handleDeleteCategory();
              }}>
              <ButtonText className="text-md font-medium text-error-50">
                {t('delete_category')}
              </ButtonText>
            </Button>
          </BottomSheetFooter>
        )}
        ref={bottomSheetModalRef}
        snapPoints={['25%', '75%']}>
        <View className="flex gap-4 ">
          <View className="my-4 flex-row items-center justify-between gap-3 px-7">
            <Text
              style={{ color: ifLight('rgb(42 48 81)', 'rgb(238 240 255)') }}
              className="flex-1 font-qs-bold text-2xl">
              {t('category_details')}
            </Text>
            <Button
              disabled={loading}
              className="h-11 rounded-xl bg-info-400"
              onPress={handleUpdateCategory}>
              {loading ? <ButtonSpinner className="mr-2" color={'rgb(199 235 252)'} /> : null}
              <ButtonText className="text-md font-medium text-info-50">{t('save')}</ButtonText>
            </Button>
          </View>
          <GHScrollView style={{ marginBottom: 196 }}>
            <View className="mb-8 px-7">
              <FormControl>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText>{t('category_name')}</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type="text"
                    defaultValue={category?.name}
                    onChange={(e) => {
                      setCategory({ ...category, name: e.nativeEvent.text });
                    }}
                    placeholder={t('category_placeholder')}
                  />
                </Input>
              </FormControl>
              <View className="mt-4 flex-row gap-3">
                <Text className="font-qs-semibold text-dark opacity-80">{t('selectable')}</Text>
                <Switch
                  trackColor={{
                    false: ifLight('rgb(238 240 255)', 'rgb(52 54 79)'),
                    true: ifLight('rgb(238 240 255)', 'rgb(52 54 79)'),
                  }}
                  onToggle={() => {
                    setCategory({ ...category, selectable: !category.selectable });
                  }}
                  defaultValue={category?.selectable}
                  value={category?.selectable}
                  className="-my-3.5"
                  thumbColor={'rgb(253 254 254)'}
                />
              </View>
              <View className="mt-4 flex-row gap-3">
                <Text className="font-qs-semibold text-dark opacity-80">{t('special')}</Text>
                <Switch
                  trackColor={{
                    false: ifLight('rgb(238 240 255)', 'rgb(52 54 79)'),
                    true: ifLight('rgb(238 240 255)', 'rgb(52 54 79)'),
                  }}
                  onToggle={() => {
                    setCategory({ ...category, special: !category.special });
                  }}
                  defaultValue={category?.special}
                  value={category?.special}
                  className="-my-3.5"
                  thumbColor={'rgb(253 254 254)'}
                />
              </View>
            </View>
            <Text className="px-7 font-qs-semibold text-xl text-dark">
              {t('recipes_with_this_category')}
            </Text>
            {category?.recipes?.length > 0 ? (
              <View className="gap-3 px-7 pb-7 pt-4">
                {category.recipes.map(({ id, recipe }: any) => (
                  <View
                    key={id}
                    className="flex-row items-center rounded-3xl bg-back p-3 shadow-soft-5">
                    <Image className="h-14 w-14 rounded-xl" source={{ uri: recipe.thumbnail }} />
                    <View className="flex-1 flex-row items-center justify-between gap-3 py-1 pl-4 pr-1">
                      <Text numberOfLines={2} className="flex-1 font-qs-medium text-lg text-dark">
                        {recipe.name}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => {
                          handleRemoveRecipeCategory(id);
                        }}>
                        <Ionicons
                          size={24}
                          name="remove-circle-outline"
                          color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center gap-4 py-8">
                <Ionicons
                  name="logo-snapchat"
                  size={48}
                  color={ifLight('#3d3d3d', 'rgb(122 124 149)')}
                />
                <Text className="px-14 text-center font-qs-medium text-dark dark:opacity-80">
                  {t('no_recipes_with_this_category')}
                </Text>
              </View>
            )}
          </GHScrollView>
        </View>
      </BottomSheet>
      <Modal isOpen={modal}>
        <ModalBackdrop />
        <ModalContent className="max-w-[375px] bg-light">
          <ModalBody className="mb-5 " contentContainerClassName="">
            <Text className="font-qs-medium text-xl text-typography-600">
              {t('creating_category')}
            </Text>
            <Text className="text text-left font-qs text-typography-500">{t('provide_name')}</Text>
            <View className="mt-4 flex flex-col gap-2">
              <Input className="flex flex-row items-center justify-between">
                <InputField
                  className="flex-1"
                  defaultValue={categoryName}
                  onChange={(e) => setCategoryName(e.nativeEvent.text)}
                  placeholder={t('category_placeholder')}
                />
              </Input>
            </View>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => {
                setModal(false);
              }}
              className="flex-grow">
              <ButtonText>{t('cancel')}</ButtonText>
            </Button>
            <Button
              onPress={() => {
                handleCategoryCreate();
              }}
              size="sm"
              className="flex-grow">
              <ButtonText>{t('confirm')}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageCategories;
