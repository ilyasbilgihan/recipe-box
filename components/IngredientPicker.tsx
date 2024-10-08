import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';

import useImagePicker from '~/utils/useImagePicker';

import { BottomSheetFooter, BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheet from '~/components/BottomSheet';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from './ui/form-control';

import { Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter } from './ui/modal';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from './ui/select';
import { Input, InputField } from './ui/input';
import { Button, ButtonText } from './ui/button';
import ImagePickerInput from './ImagePickerInput';
import { ImagePickerAsset } from 'expo-image-picker';
import useCustomToast from './useCustomToast';
import { useGlobalContext } from '~/context/GlobalProvider';
import { useTranslation } from 'react-i18next';

type RecipeIngredient = {
  ingredient_id: string | undefined;
  name: string;
  image: string;
  amount: string;
  unit: string;
};

type Ingredient = {
  id?: string;
  name: string;
  image: string;
};

const units = ['Kg', 'G', 'mG', 'Pound', 'Ounce', 'Tsp', 'Tbsp', 'Cup', 'L', 'mL', 'Piece'];

type newIngredient = { name: string; image: ImagePickerAsset };

const IngredientPicker = ({
  ingredients,
  setIngredients,
  newIngredients,
  setNewIngredients,
  selectedIngredients,
  setSelectedIngredients,
}: {
  ingredients: Ingredient[];
  newIngredients?: newIngredient[];
  setNewIngredients?: React.Dispatch<React.SetStateAction<newIngredient[]>>;
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  selectedIngredients: RecipeIngredient[];
  setSelectedIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const { ifLight } = useGlobalContext();
  const toast = useCustomToast();

  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  useEffect(() => {
    if (searchTerm) {
      const filtered = ingredients.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredIngredients(filtered);
    } else {
      setFilteredIngredients([]);
    }
  }, [searchTerm, ingredients]);

  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [modal, setModal] = useState(false);

  const resetModal = () => {
    setModal(false);
    setSelectedIngredient(null);
    setAmount('');
    setUnit('');
  };

  const [ingredientName, setIngredientName] = useState('');
  const { image: ingredientImage, setImage: setIngredientImage, pickImage } = useImagePicker();
  const [newIngredientModal, setNewIngredientModal] = useState(false);

  const resetIngredientModal = () => {
    setNewIngredientModal(false);
    setIngredientName('');
    setIngredientImage(undefined);
  };

  useEffect(() => {
    // custom back handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      bottomSheetModalRef.current?.forceClose();
      return null;
    });

    return () => backHandler.remove();
  }, []);

  const { t } = useTranslation();
  return (
    <>
      <FormControl>
        <FormControlLabel className="mb-1">
          <FormControlLabelText>{t('ingredients')}</FormControlLabelText>
        </FormControlLabel>
        <Input className="flex h-fit w-full flex-col gap-2 bg-back p-2">
          <View className="p-2">
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map((ingredient, index) => (
                <View
                  key={index}
                  className="flex w-full flex-row items-center justify-between gap-2">
                  <View className="flex flex-1 flex-row items-center gap-2">
                    <Image source={{ uri: ingredient.image }} style={{ width: 50, height: 50 }} />
                    <Text className="flex-wrap font-qs-semibold text-lg text-dark">
                      {ingredient.name}
                    </Text>
                    <Text className="font-qs-medium text-dark">
                      ({ingredient.amount} {ingredient.unit})
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
                    }}>
                    <Ionicons name="trash-outline" size={22} color="#737373" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="mb-8 pb-8 pt-2 text-center font-qs-medium text-sm text-typography-600">
                {t('no_ingredients')}
              </Text>
            )}
          </View>
          <Button className="w-full rounded-md bg-info-500" onPress={handlePresentModalPress}>
            <ButtonText className="text-md font-medium text-info-50">
              {t('add_ingredient')}
            </ButtonText>
          </Button>
        </Input>
        <FormControlError>
          <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
        </FormControlError>
      </FormControl>
      <BottomSheet
        ref={bottomSheetModalRef}
        snapPoints={['30%', '60%']}
        footerComponent={(props) => (
          <BottomSheetFooter {...props} bottomInset={20} style={{ paddingHorizontal: 28 }}>
            {newIngredients ? (
              <Button
                className="rounded-lg bg-info-500"
                onPress={() => {
                  bottomSheetModalRef.current?.dismiss();
                  setNewIngredientModal(true);
                }}>
                <ButtonText className="text-md font-medium text-info-50">
                  {t('new_ingredient')}
                </ButtonText>
              </Button>
            ) : null}
          </BottomSheetFooter>
        )}>
        <View className="flex flex-col ">
          <FormControl className="px-7 pt-4">
            <FormControlLabel className="mb-1">
              <FormControlLabelText className="text-dark">
                {t('search_ingredient')}
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="flex h-10 flex-row items-center justify-between rounded">
              <InputField
                className="flex-1"
                defaultValue={searchTerm}
                onChange={(e) => setSearchTerm(e.nativeEvent.text)}
                placeholder={t('ingredient_placeholder')}
              />
              <View className="flex h-10 w-10 items-center justify-center">
                <Ionicons
                  name="search-sharp"
                  size={16}
                  color={ifLight('rgb(140 140 140)', 'rgb(163 163 163)')}
                />
              </View>
            </Input>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <GHScrollView style={{ marginBottom: 215, paddingHorizontal: 28 }}>
            <View className="my-4">
              {(filteredIngredients.length > 0 ? filteredIngredients : ingredients).map(
                (item, index) => (
                  <TouchableOpacity
                    onPress={() => {
                      bottomSheetModalRef.current?.dismiss();
                      setSelectedIngredient(item);
                      setModal(true);
                    }}
                    activeOpacity={0.75}
                    key={item.id || item.name}
                    style={{
                      backgroundColor: index % 2 === 1 ? ifLight('#e6e6e6', 'rgb(52 54 79)') : '',
                    }}
                    className="flex flex-row items-center gap-4 rounded-md p-2">
                    <Image source={{ uri: item.image }} style={{ width: 50, height: 50 }} />
                    <Text className="font-qs-medium text-dark">{item.name}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </GHScrollView>
        </View>
      </BottomSheet>
      <Modal
        isOpen={modal}
        onClose={() => {
          resetModal();
        }}>
        <ModalBackdrop />
        <ModalContent className="max-w-[375px] bg-light">
          <ModalBody className="mb-5 " contentContainerClassName="">
            <Text className="font-qs-medium text-xl text-typography-600">
              {t('dynamic_ingredient_add', {
                item: selectedIngredient?.name,
              })}
            </Text>
            <Text className="text text-left font-qs text-typography-500">
              {t('provide_ingredient_add_data')}
            </Text>
            <View className="mt-4 flex flex-col gap-2">
              <Select
                onValueChange={(value) => {
                  setUnit(value);
                }}>
                <SelectTrigger
                  className="bg-back dark:border-transparent dark:focus:border-stone-800"
                  variant="outline"
                  size="md">
                  <SelectInput className="flex-1" placeholder="Unit" />
                  <View className="px-4">
                    <Ionicons name="chevron-down" size={14} color={'#737373'} />
                  </View>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {units.map((val) => (
                      <SelectItem key={val} label={val} value={val} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
              <Input className="flex flex-row items-center justify-between">
                <InputField
                  className="flex-1"
                  keyboardType="numeric"
                  defaultValue={amount}
                  onChange={(e) => setAmount(e.nativeEvent.text)}
                  placeholder={t('amount')}
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
                resetModal();
              }}
              className="flex-grow">
              <ButtonText>{t('cancel')}</ButtonText>
            </Button>
            <Button
              onPress={() => {
                if (selectedIngredient && amount && unit && amount !== '0') {
                  let isExist = selectedIngredients.find(
                    (item) => item.name.toLowerCase() === selectedIngredient.name.toLowerCase()
                  );

                  if (!isExist) {
                    setSelectedIngredients([
                      ...selectedIngredients,
                      {
                        ingredient_id: selectedIngredient.id,
                        name: selectedIngredient.name,
                        image: selectedIngredient.image,
                        amount: amount,
                        unit: unit,
                      },
                    ]);
                  } else {
                    toast.warning(t('ingredient_already_added'));
                  }

                  resetModal();
                } else {
                  toast.warning(t('fill_all_fields'));
                }
              }}
              size="sm"
              className="flex-grow">
              <ButtonText>{t('confirm')}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={newIngredientModal}
        onClose={() => {
          resetIngredientModal();
        }}>
        <ModalBackdrop />
        <ModalContent className="max-w-[375px] bg-light">
          <ModalBody className="mb-5 " contentContainerClassName="">
            <Text className="font-qs-medium text-xl text-typography-600">
              {t('ingredient_create')}
            </Text>
            <Text className="text text-left font-qs text-typography-500">
              {t('provide_ingredient_create_data')}
            </Text>
            <View className="mt-4 flex flex-col gap-2">
              <FormControl>
                <Input className="flex flex-row items-center justify-between">
                  <InputField
                    className="flex-1"
                    defaultValue={ingredientName}
                    onChange={(e) => setIngredientName(e.nativeEvent.text)}
                    placeholder={t('ingredient_placeholder')}
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
                </FormControlError>
              </FormControl>
              <FormControl>
                <FormControlLabel className="mb-1">
                  <FormControlLabelText>{t('ingredient_image')}</FormControlLabelText>
                </FormControlLabel>
                <View className="w-1/3">
                  <ImagePickerInput
                    defaultImage={ingredientImage?.uri}
                    image={ingredientImage}
                    pickImage={pickImage}
                  />
                </View>
                <FormControlError>
                  <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
                </FormControlError>
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
              className="flex-grow">
              <ButtonText>{t('cancel')}</ButtonText>
            </Button>
            <Button
              onPress={() => {
                if (!newIngredients || !setNewIngredients) {
                  return;
                }
                if (ingredientName && ingredientImage) {
                  let isExistInNewOnes = newIngredients.find(
                    (item) => item.name.toLowerCase() === ingredientName.toLowerCase()
                  );
                  let isExistInRecent = ingredients.find((item) => item.name === ingredientName);

                  if (!isExistInNewOnes && !isExistInRecent) {
                    setNewIngredients([
                      ...newIngredients,
                      {
                        name: ingredientName,
                        image: ingredientImage,
                      },
                    ]);
                    setIngredients([
                      ...ingredients,
                      {
                        name: ingredientName,
                        image: ingredientImage.uri,
                      },
                    ]);
                    setSelectedIngredient({
                      name: ingredientName,
                      image: ingredientImage.uri,
                    });
                    setModal(true);
                  } else {
                    toast.error(t('ingredient_already_created') + ingredientName);
                  }

                  resetIngredientModal();
                } else {
                  toast.warning(t('fill_all_fields'));
                }
              }}
              size="sm"
              className="flex-grow">
              <ButtonText>{t('confirm')}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default IngredientPicker;
