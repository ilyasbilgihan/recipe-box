import { View, Text, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TabBarIcon } from './TabBarIcon';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheet from '~/components/BottomSheet';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from './ui/form-control';

import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
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
import { Input } from './ui/input';
import { Button, ButtonText } from './ui/button';

type RecipeIngredient = {
  ingredient_id: string;
  name: string;
  image: string;
  amount: string;
  unit: string;
};

type Ingredient = {
  id: string;
  name: string;
  image: string;
};

const units = {
  kg: 'Kg',
  g: 'G',
  mg: 'mG',
  pound: 'Pound',
  ounce: 'Ounce',
  tsp: 'Tsp',
  tbsp: 'Tbsp',
  cup: 'Cup',
  l: 'L',
  mL: 'mL',
  piece: 'Piece',
};

const IngredientPicker = ({
  ingredients,
  selectedIngredients,
  setSelectedIngredients,
}: {
  ingredients: Ingredient[];
  selectedIngredients: RecipeIngredient[];
  setSelectedIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [modal, setModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

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
  }, [searchTerm]);

  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');

  const resetModal = () => {
    setModal(false);
    setSelectedIngredient(null);
    setAmount('');
    setUnit('');
  };

  return (
    <>
      <FormControl>
        <FormControlLabel className="mb-1">
          <FormControlLabelText>Ingredients</FormControlLabelText>
        </FormControlLabel>
        <Input className="flex h-fit w-full flex-col gap-2 bg-white p-2">
          <View className="p-2">
            {selectedIngredients.length > 0 ? (
              selectedIngredients.map((ingredient, index) => (
                <View
                  key={index}
                  className="flex w-full flex-row items-center justify-between gap-2">
                  <View className="flex flex-row items-center gap-2">
                    <Image source={{ uri: ingredient.image }} style={{ width: 50, height: 50 }} />
                    <Text className="font-qs-semibold text-lg">{ingredient.name}</Text>
                    <Text className="font-qs-medium text-dark">
                      ({ingredient.amount} {ingredient.unit})
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    className="px-4 "
                    onPress={() => {
                      setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
                    }}>
                    <TabBarIcon name="trash" color="#737373" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="mb-8 pb-8 pt-2 text-center font-qs-medium text-sm text-typography-600">
                No Ingredients
              </Text>
            )}
          </View>
          <Button className="w-full rounded-md bg-sky-600" onPress={handlePresentModalPress}>
            <ButtonText className="text-md font-medium">Add Ingredient</ButtonText>
          </Button>
        </Input>
        <FormControlError>
          <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
        </FormControlError>
      </FormControl>
      <BottomSheet
        ref={bottomSheetModalRef}
        snapPoints={['30%', '60%']}
        /* footerComponent={(props) => (
            <BottomSheetFooter {...props} bottomInset={20} style={{ paddingHorizontal: 28 }}>
              <Button
                style={{ backgroundColor: 'rgb(2 132 199)' }}
                className="rounded-lg"
                onPress={() => console.log('open ingredient creation modal')}>
                {loading ? <ButtonSpinner color={'white'} /> : null}
                <ButtonText className="text-md font-medium text-light">New Ingredient</ButtonText>
              </Button>
            </BottomSheetFooter>
          )} */
      >
        <View className="flex flex-col ">
          <FormControl className="px-7 pt-4">
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Search Ingredient</FormControlLabelText>
            </FormControlLabel>
            <View
              style={{ borderColor: '#D3D3D3', borderWidth: 1 }}
              className="flex h-10 flex-row items-center justify-between rounded bg-white  px-3">
              <TextInput
                className="flex-1"
                defaultValue={searchTerm}
                onChange={(e) => setSearchTerm(e.nativeEvent.text)}
                placeholder="Flour"
              />
              <View className="flex h-10 items-center justify-center">
                <TabBarIcon name="search" size={16} color={'#737373'} />
              </View>
            </View>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <GHScrollView style={{ marginBottom: 150, paddingHorizontal: 28 }}>
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
                    key={item.id}
                    style={{ backgroundColor: index % 2 === 1 ? '#E6E6E6' : '' }}
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
              You're going to add{' '}
              <Text className="font-qs-bold text-dark">{selectedIngredient?.name}</Text>
            </Text>
            <Text className="text text-left font-qs text-typography-500">
              Please provide unit and amount.
            </Text>
            <View className="mt-4 flex flex-col gap-2">
              <Select
                onValueChange={(value) => {
                  setUnit(value);
                }}>
                <SelectTrigger className="bg-white" variant="outline" size="md">
                  <SelectInput className="flex-1" placeholder="Unit" />
                  <View className="px-4">
                    <TabBarIcon name="chevron-down" size={14} color={'#737373'} />
                  </View>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {Object.entries(units).map(([value, item]) => (
                      <SelectItem key={value} label={item} value={value} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
              <Input className="flex flex-row items-center justify-between bg-white px-3">
                <TextInput
                  className="flex-1"
                  keyboardType="numeric"
                  defaultValue={amount}
                  onChange={(e) => setAmount(e.nativeEvent.text)}
                  placeholder="Amount"
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
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={() => {
                if (selectedIngredient && amount && unit && amount !== '0') {
                  let isExist = selectedIngredients.find(
                    (item) => item.ingredient_id === selectedIngredient.id && item.unit === unit
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
                    Alert.alert('Error', 'Ingredient already added');
                  }

                  resetModal();
                } else {
                  Alert.alert('Error', 'Please fill in all fields');
                }
              }}
              size="sm"
              className="flex-grow">
              <ButtonText>Confirm</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default IngredientPicker;
