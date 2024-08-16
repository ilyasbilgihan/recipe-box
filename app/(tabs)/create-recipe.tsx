import {
  View,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  TextInput,
  SectionList,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, uploadImageToSupabaseBucket } from '~/utils/supabase';
import { router } from 'expo-router';
import { useGlobalContext } from '~/context/GlobalProvider';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '~/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '~/components/ui/input';
import { Box } from '~/components/ui/box';
import { ButtonSpinner, ButtonText, Button } from '~/components/ui/button';
import { Textarea, TextareaInput } from '~/components/ui/textarea';

import BottomSheet from '~/components/BottomSheet';
import { BottomSheetModal, BottomSheetFooter } from '@gorhom/bottom-sheet';
import ImagePickerInput from '~/components/ImagePickerInput';
import useImagePicker from '~/utils/useImagePicker';
import { TabBarIcon } from '~/components/TabBarIcon';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '~/components/ui/modal';
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
} from '~/components/ui/select';

type Ingredient = {
  id: string;
  name: string;
  image: string;
};

type RecipeIngredient = {
  ingredient_id: string;
  name: string;
  image: string;
  amount: string;
  unit: string;
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

const CreateRecipe = () => {
  const { session } = useGlobalContext();
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    instructions: '',
    thumbnail: '',
  });
  const [loading, setLoading] = useState(false);
  const { image, setImage, pickImage } = useImagePicker();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const {
    image: ingredientImage,
    setImage: setIngredientImage,
    pickImage: pickIngredientImage,
  } = useImagePicker();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setLoading(false);
      fetchIngredients();
      resetFields();
      setSelectedIngredient(null);
      setSelectedIngredients([]);
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // fetch ingredients

    fetchIngredients();
  }, []);
  const fetchIngredients = async () => {
    const { data, error } = await supabase.from('ingredient').select('*');
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    if (data) {
      setIngredients(data);
    }
  };

  const setField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateRecipe = async () => {
    setLoading(true);

    if (
      formData.name === '' ||
      formData.duration === '' ||
      formData.instructions === '' ||
      selectedIngredients.length == 0
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      setLoading(false);
      return;
    }

    let uploadedImageUrl = null;
    if (image !== undefined) {
      const url = await uploadImageToSupabaseBucket('recipe_images', image);
      uploadedImageUrl = url;
    }

    const { data, error } = await supabase
      .from('recipe')
      .insert({
        name: formData.name,
        duration: formData.duration,
        instructions: formData.instructions,
        thumbnail: uploadedImageUrl ? uploadedImageUrl : formData.thumbnail,
        owner_id: session?.user.id,
      })
      .select('id')
      .single();

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }
    console.log('data ->', data);
    if (data) {
      let ingredientsToInsert: {
        ingredient_id: string;
        recipe_id: any;
        amount: string;
        unit: string;
      }[] = [];
      for (let i = 0; i < selectedIngredients.length; i++) {
        const ingredient = selectedIngredients[i];
        ingredientsToInsert.push({
          ingredient_id: ingredient.ingredient_id,
          recipe_id: data.id,
          amount: ingredient.amount,
          unit: ingredient.unit,
        });
      }

      console.log('ingredientsToInsert ->', ingredientsToInsert);
      const { data: ingData, error: ingError } = await supabase
        .from('recipe_ingredient')
        .insert(ingredientsToInsert);
      console.log('ingData ->', ingData);
      console.log('ingError ->', ingError);
    }

    setLoading(false);
    Alert.alert('Success', 'Recipe Created Successfully');
    resetFields();
    router.replace('/profile');
  };

  const resetFields = () => {
    setFormData({
      name: '',
      duration: '',
      instructions: '',
      thumbnail: '',
    });

    setSelectedIngredients([]);
    setImage(undefined);
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

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

  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);

  const [amountModal, setAmountModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');

  const resetAmountModal = () => {
    setAmountModal(false);
    setSelectedIngredient(null);
    setAmount('');
    setUnit('');
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex w-full flex-1 items-center justify-between px-8">
        <Box className="flex w-full gap-3 pb-12">
          {/* Recipe Name */}
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Recipe Name</FormControlLabelText>
            </FormControlLabel>
            <Input className="bg-white">
              <InputField
                type="text"
                defaultValue={formData.name}
                onChange={(e) => setField('name', e.nativeEvent.text)}
                placeholder="Spicy Ramen Noodle"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          {/* Thumbnail */}
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Thumbnail</FormControlLabelText>
            </FormControlLabel>
            <ImagePickerInput
              defaultImage={formData.thumbnail}
              image={image}
              pickImage={pickImage}
            />
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          {/* Duration */}
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Duration</FormControlLabelText>
            </FormControlLabel>
            <Input className="flex flex-row items-center justify-between bg-white px-3">
              <TextInput
                className="flex-1"
                keyboardType="numeric"
                defaultValue={formData.duration}
                onChange={(e) => setField('duration', e.nativeEvent.text)}
                placeholder="0"
              />
              <Text className="font-qs-medium text-sm text-dark">minute(s)</Text>
            </Input>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
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
                        <Image
                          source={{ uri: ingredient.image }}
                          style={{ width: 50, height: 50 }}
                        />
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
              <Button
                disabled={loading}
                className="w-full rounded-md bg-sky-600"
                onPress={handlePresentModalPress}>
                <ButtonText className="text-md font-medium">Add Ingredient</ButtonText>
              </Button>
            </Input>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          {/* Instructions */}
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Instructions</FormControlLabelText>
            </FormControlLabel>
            <Textarea className="bg-white">
              <TextareaInput
                numberOfLines={5}
                defaultValue={formData.instructions}
                onChange={(e) => setField('instructions', e.nativeEvent.text)}
                textAlignVertical="top"
                placeholder="Todo: rich text editor"
                className="p-3"
              />
            </Textarea>
          </FormControl>
          {/* Save Button */}
          <Button
            disabled={loading}
            className="mt-4 h-11 rounded-xl bg-warning-400"
            onPress={handleCreateRecipe}>
            {loading ? <ButtonSpinner color={'white'} /> : null}
            <ButtonText className="text-md ml-4 font-medium">Create Recipe</ButtonText>
          </Button>
        </Box>
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
                        setAmountModal(true);
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
          isOpen={amountModal}
          onClose={() => {
            resetAmountModal();
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
                  resetAmountModal();
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

                    resetAmountModal();
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
      </View>
    </ScrollView>
  );
};

export default CreateRecipe;
