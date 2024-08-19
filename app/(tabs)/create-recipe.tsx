import { View, Alert, ScrollView, RefreshControl, Text, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
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
import { Input, InputField } from '~/components/ui/input';
import { Box } from '~/components/ui/box';
import { ButtonSpinner, ButtonText, Button } from '~/components/ui/button';
import { Textarea, TextareaInput } from '~/components/ui/textarea';

import ImagePickerInput from '~/components/ImagePickerInput';
import useImagePicker from '~/utils/useImagePicker';

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

import IngredientPicker from '~/components/IngredientPicker';

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
  const [refreshing, setRefreshing] = React.useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setLoading(false);
      fetchIngredients();
      resetFields();
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
          {/* Ingredients */}
          <IngredientPicker
            ingredients={ingredients}
            selectedIngredients={selectedIngredients}
            setSelectedIngredients={setSelectedIngredients}
          />
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
      </View>
    </ScrollView>
  );
};

export default CreateRecipe;
