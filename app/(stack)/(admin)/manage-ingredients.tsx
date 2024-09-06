import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

import { deleteImage, supabase, uploadImageToSupabaseBucket } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import { Button, ButtonSpinner, ButtonText } from '~/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '~/components/ui/form-control';
import { Input, InputField } from '~/components/ui/input';
import useCustomToast from '~/components/useCustomToast';
import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter } from '~/components/ui/modal';
import ImagePickerInput from '~/components/ImagePickerInput';
import useImagePicker from '~/utils/useImagePicker';
import { useTranslation } from 'react-i18next';

const ManageIngredients = () => {
  const { t } = useTranslation();
  const toast = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<any>([]);
  const [ingredient, setIngredient] = useState<any>();
  const [ingredientName, setIngredientName] = useState('');
  const [modal, setModal] = useState(false);

  const { image: ingredientImage, setImage: setIngredientImage, pickImage } = useImagePicker();

  const { ifLight } = useGlobalContext();
  useFocusEffect(
    useCallback(() => {
      fetchIngredients();
    }, [])
  );

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from('ingredient')
      .select('*')
      .order('id', { ascending: true });
    if (data) {
      setIngredients(data);
    }
  };

  const handleUpdateIngredient = async () => {
    let ingToAdd = ingredient?.name?.trim();
    if (!ingToAdd) {
      toast.warning('Ingredient name is required');
      return;
    }
    if (!loading) {
      setLoading(true);

      let ingredientImageUrl = ingredient?.image;
      if (ingredientImage) {
        const { url, error } = await uploadImageToSupabaseBucket(
          'ingredient_images',
          ingredientImage
        );
        if (error) {
          toast.error('Image upload error ' + error.message);
          return;
        } else {
          const { error: delImgError } = await deleteImage(
            'ingredient_images/' + ingredient.image.split('ingredient_images/')[1]
          );
          if (delImgError) {
            toast.error('Delete ingredient image error ' + delImgError.message);
            return;
          }
          ingredientImageUrl = url;
        }
      }
      const { error: ingError } = await supabase
        .from('ingredient')
        .update({ name: ingToAdd, image: ingredientImageUrl })
        .eq('id', ingredient?.id);
      if (!ingError) {
        fetchIngredients();
        toast.success('Ingredient created successfully');
        resetIngredientModal();
      } else {
        toast.error('Something went wrong. ' + ingError.message);
      }

      setLoading(false);
    }
  };

  const handleDeleteIngredient = async (ingredient: any) => {
    toast.dismisAll();
    toast.confirm({
      title: 'Are you sure you want to delete this ingredient?',
      message: ingredient.name,
      icon: <Ionicons name="trash-outline" size={20} />,
      handler: async () => {
        const { error } = await supabase.from('ingredient').delete().eq('id', ingredient.id);
        if (!error) {
          const { error: delImgError } = await deleteImage(
            'ingredient_images/' + ingredient.image.split('ingredient_images/')[1]
          );
          if (delImgError) {
            toast.error('Delete ingredient image error ' + delImgError.message);
            return;
          }
          fetchIngredients();
          toast.success('Ingredient deleted successfully');
          resetIngredientModal();
        } else {
          toast.error('Something went wrong ' + error.message);
        }
      },
    });
  };

  const handleCreateIngredient = async () => {
    let ingToAdd = ingredientName.trim();
    if (!ingToAdd) {
      toast.warning('Ingredient name is required');
      return;
    }

    if (!ingredientImage) {
      toast.warning('Ingredient image is required');
      return;
    }

    if (!loading) {
      setLoading(true);

      const { url, error } = await uploadImageToSupabaseBucket(
        'ingredient_images',
        ingredientImage
      );
      if (error) {
        toast.error('Image upload error ' + error.message);
      } else {
        const { error: ingError } = await supabase
          .from('ingredient')
          .insert({ name: ingToAdd, image: url });
        if (!ingError) {
          fetchIngredients();
          toast.success('Ingredient created successfully');
          resetIngredientModal();
        } else {
          toast.error('Something went wrong. ' + ingError.message);
        }
      }

      setLoading(false);
    }
  };

  const resetIngredientModal = () => {
    setModal(false);
    setIngredientName('');
    setIngredient(undefined);
    setIngredientImage(undefined);
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
            <Text className="font-qs-bold text-2xl text-dark">{t('ingredients')}</Text>
            <TouchableOpacity
              onPress={() => {
                setIngredientName('');
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
            {ingredients.length > 0
              ? ingredients.map((ingredient: any) => (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      setIngredient(ingredient);
                      setModal(true);
                    }}
                    key={ingredient?.id}
                    style={{ borderRadius: 32 }}
                    className="relative flex-row items-center gap-4 bg-back p-2 shadow-soft-5">
                    <Image className="h-14 w-14 rounded-full" source={{ uri: ingredient?.image }} />
                    <Text numberOfLines={1} className="flex-1 font-qs-semibold text-dark">
                      {ingredient?.name}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => handleDeleteIngredient(ingredient)}
                      className="ml-auto h-14 w-14 items-center justify-center">
                      <Ionicons
                        size={20}
                        name="trash-outline"
                        color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              : null}
          </View>
        </View>
      </ScrollView>
      <Modal isOpen={modal}>
        <ModalBackdrop />
        <ModalContent className="max-w-[375px] bg-light">
          <ModalBody className="mb-5 " contentContainerClassName="">
            <Text className="font-qs-medium text-xl text-dark">
              {ingredient ? t('update_ingredient') : t('new_ingredient')}
            </Text>
            <Text className="text text-left font-qs text-typography-500">
              {t('provide_ingredient_create_data')}
            </Text>
            <View className="mt-4 flex flex-col gap-2">
              <FormControl>
                <Input className="flex flex-row items-center justify-between bg-back">
                  <InputField
                    className="flex-1"
                    defaultValue={ingredient?.name || ingredientName}
                    onChange={(e) => {
                      if (ingredient) {
                        setIngredient({ ...ingredient, name: e.nativeEvent.text });
                      } else {
                        setIngredientName(e.nativeEvent.text);
                      }
                    }}
                    placeholder={t('ingredient_placeholder')}
                  />
                </Input>
              </FormControl>
              <FormControl>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText>{t('ingredient_image')}</FormControlLabelText>
                </FormControlLabel>
                <View className="w-1/3">
                  <ImagePickerInput
                    defaultImage={ingredient?.image || ingredientImage?.uri}
                    image={ingredientImage}
                    pickImage={pickImage}
                  />
                </View>
              </FormControl>
            </View>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => {
                resetIngredientModal();
              }}
              className="flex-1">
              <ButtonText>{t('cancel')}</ButtonText>
            </Button>
            <Button
              disabled={loading}
              onPress={() => {
                if (ingredient) {
                  handleUpdateIngredient();
                } else {
                  handleCreateIngredient();
                }
              }}
              size="sm"
              className="flex-1 bg-info-400">
              {loading ? (
                <ButtonSpinner size={16} className="mr-2" color={'rgb(199 235 252)'} />
              ) : null}
              <ButtonText className="text-md font-medium text-info-50">{t('confirm')}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageIngredients;
