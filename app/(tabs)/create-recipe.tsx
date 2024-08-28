import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { deleteImage, supabase, uploadImageToSupabaseBucket } from '~/utils/supabase';
import useImagePicker from '~/utils/useImagePicker';
import { editorCSS } from '~/utils/editorCSS';
import { useGlobalContext } from '~/context/GlobalProvider';

import { RichText, TenTapStartKit, Toolbar, useEditorBridge } from '@10play/tentap-editor';

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
import ImagePickerInput from '~/components/ImagePickerInput';
import IngredientPicker from '~/components/IngredientPicker';
import CategoryPicker from '~/components/CategoryPicker';
import useCustomToast from '~/components/useCustomToast';

type Ingredient = {
  id?: string;
  name: string;
  image: string;
};

type RecipeIngredient = {
  ingredient_id: string | undefined;
  name: string;
  image: string;
  amount: string;
  unit: string;
};

type Category = {
  id: number;
  name: string;
};

const CreateRecipe = ({ id = null, recipe }: any) => {
  const { session } = useGlobalContext();
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const toast = useCustomToast();

  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    duration: recipe?.duration || '',
    instructions: recipe?.instructions || '<p>Click to add your <strong>instructions</strong></p>',
    thumbnail: recipe?.thumbnail || '',
  });
  const { image, setImage, pickImage } = useImagePicker();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>(
    recipe?.ingredients || []
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    recipe?.categories || []
  );

  const [openRichText, setOpenRichText] = React.useState(false);
  const timeout = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const [newIngredients, setNewIngredients] = useState<{ name: string; image: ImagePickerAsset }[]>(
    []
  );

  const setField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .neq('id', 1)
      .order('id', { ascending: true });

    if (error) {
      console.log('error', error);
      return;
    }

    if (data) {
      setCategories(data);
    }
  };

  const fetchIngredients = async () => {
    const { data, error } = await supabase.from('ingredient').select('*');
    if (error) {
      toast.error('Something went wrong. ' + error.message);
      return;
    }
    if (data) {
      setIngredients(data);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(false);
    fetchIngredients();
    resetFields();
    fetchCategories();
    setSelectedIngredients(recipe?.ingredients || []);
    setNewIngredients([]);
    setRefreshing(false);
    editor.setContent(`<p>Click to add your <strong>instructions</strong></p>`);
  }, []);

  const editor = useEditorBridge({
    autofocus: false,
    bridgeExtensions: TenTapStartKit,
    avoidIosKeyboard: true,
    theme: {
      webview: {
        backgroundColor: '#FAF9FB',
        marginHorizontal: 12,
      },
    },
    initialContent: formData.instructions,
    onChange: async () => {
      // debounce
      clearTimeout(timeout.current);
      timeout.current = setTimeout(async () => {
        let content = await editor.getHTML();
        setField('instructions', content);
        setSaveIndicator(true);
        setTimeout(() => {
          setSaveIndicator(false);
        }, 1000);
      }, 2000);
    },
  });

  useEffect(() => {
    fetchIngredients();
    fetchCategories();
    // inject css
    editor.injectCSS(editorCSS);
  }, []);

  const closeRichText = () => {
    editor.blur();
    setOpenRichText(false);
    navigation.setOptions({
      title: 'Create Recipe',
      headerLeft: () => null,
    });
  };

  useEffect(() => {
    // custom back handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (openRichText) {
        closeRichText();
        return true;
      }
      return null;
    });

    return () => backHandler.remove();
  }, [openRichText]);

  const handleUploadImage = async () => {
    let uploadedImageUrl = null;
    if (image !== undefined) {
      if (id) {
        const { error } = await deleteImage(
          'recipe_images/' + formData.thumbnail.split('recipe_images/')[1]
        );
        if (error) {
          toast.error('Delete image error ' + error.message);
        }
      }
      const { url, error } = await uploadImageToSupabaseBucket('recipe_images', image);
      if (error) {
        toast.error('Image upload error ' + error.message);
      } else {
        uploadedImageUrl = url;
      }
    }
    return uploadedImageUrl;
  };

  const handleInsertRecipe = async (uploadedImageUrl: any) => {
    const { data: newRecipe, error } = await supabase
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
      toast.error('Create Recipe Error. ' + error.message);
      setLoading(false);
      return;
    }
    return newRecipe.id;
  };

  const handleUpdateRecipe = async (uploadedImageUrl: any) => {
    const { data: updatedRecipe, error } = await supabase
      .from('recipe')
      .update({
        name: formData.name,
        duration: formData.duration,
        instructions: formData.instructions,
        thumbnail: uploadedImageUrl ? uploadedImageUrl : formData.thumbnail,
      })
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      toast.error('Update Recipe Error. ' + error.message);
      setLoading(false);
      return;
    }
    return updatedRecipe.id;
  };

  const handleInsertIngredients = async (upserted_id: any) => {
    let ingredientsToInsert: {
      ingredient_id: string;
      recipe_id: any;
      amount: string;
      unit: string;
    }[] = [];

    for (let i = 0; i < selectedIngredients.length; i++) {
      const ingredient = selectedIngredients[i];
      if (ingredient.ingredient_id != undefined) {
        ingredientsToInsert.push({
          ingredient_id: ingredient.ingredient_id!,
          recipe_id: upserted_id,
          amount: ingredient.amount,
          unit: ingredient.unit,
        });
      } else {
        // add non existed (undefined id) ingredient to supabase
        let newIngImage = newIngredients.find((item) => (item.name = ingredient.name))?.image;

        const { url, error } = await uploadImageToSupabaseBucket('ingredient_images', newIngImage!);
        if (error) {
          toast.error('Image upload error ' + error.message);
        } else {
          const { data: newIng, error: newIngErr } = await supabase
            .from('ingredient')
            .insert({ name: ingredient.name, image: url })
            .select('id, name, image')
            .single();

          console.log('newIng Err ->', newIngErr);

          ingredientsToInsert.push({
            ingredient_id: newIng?.id, // instead of undefined
            recipe_id: upserted_id,
            amount: ingredient.amount,
            unit: ingredient.unit,
          });
        }
      }
    }

    console.log('ingredientsToInsert ->', ingredientsToInsert);
    const { data: ingData, error: ingError } = await supabase
      .from('recipe_ingredient')
      .insert(ingredientsToInsert);
    console.log('ingData ->', ingData);
    console.log('ingError ->', ingError);
  };

  const handleInsertCategories = async (upserted_id: any) => {
    let categoryToInsert: {
      category_id: number;
      recipe_id: any;
    }[] = [];
    for (let i = 0; i < selectedCategories.length; i++) {
      const category = selectedCategories[i];
      categoryToInsert.push({
        category_id: category.id,
        recipe_id: upserted_id,
      });
    }
    const { data: catData, error: catError } = await supabase
      .from('recipe_category')
      .insert(categoryToInsert);
    console.log('catData ->', catData);
    console.log('catError ->', catError);
  };

  const handleCreateRecipe = async () => {
    if (loading) return;

    setLoading(true);

    if (
      formData.name === '' ||
      formData.duration === '' ||
      formData.instructions === '' ||
      selectedIngredients.length == 0
    ) {
      toast.warning('Please fill in all the required fields.');
      setLoading(false);
      return;
    }

    let uploadedImageUrl = await handleUploadImage();

    let upserted_id = null;
    if (!id) {
      upserted_id = await handleInsertRecipe(uploadedImageUrl);
    } else {
      upserted_id = await handleUpdateRecipe(uploadedImageUrl);
    }

    if (upserted_id) {
      if (id) {
        // delete old ingredients and categories
        const { error: delIngErr } = await supabase
          .from('recipe_ingredient')
          .delete()
          .eq('recipe_id', id);

        console.log('delIngErr ->', delIngErr);

        const { error: delCatErr } = await supabase
          .from('recipe_category')
          .delete()
          .eq('recipe_id', id);

        console.log('delCatErr ->', delCatErr);
      }

      if (selectedIngredients.length > 0) {
        await handleInsertIngredients(upserted_id);
      }
      if (selectedCategories.length > 0) {
        await handleInsertCategories(upserted_id);
      }
    }

    setLoading(false);
    resetFields();
    if (id) {
      toast.success('Recipe Updated Successfully');
    } else {
      toast.success('Recipe Created Successfully');
    }
    router.replace(`/recipe/${upserted_id}`);
  };

  const resetFields = () => {
    setFormData({
      name: recipe?.name || '',
      duration: recipe?.duration || '',
      instructions:
        recipe?.instructions || '<p>Click to add your <strong>instructions</strong></p>',
      thumbnail: recipe?.thumbnail || '',
    });
    editor.setContent('<p>Click to add your <strong>instructions</strong></p>');
    setSelectedCategories([]);
    setHeight(50);
    setSelectedIngredients(recipe?.ingredients || []);
    setNewIngredients([]);
    setImage(undefined);
  };

  const [height, setHeight] = useState(50);

  const onWebViewMessage = (event: WebViewMessageEvent) => {
    console.log(event.nativeEvent);
    setHeight(+event.nativeEvent.data);
  };

  return (
    <SafeAreaView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="h-16 flex-row items-center justify-center px-7">
          <Text className="font-qs-bold text-2xl text-dark">{id ? 'Edit' : 'Create'} Recipe</Text>
        </View>
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
            {/* Category */}
            <CategoryPicker
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
            {/* Ingredients */}
            <IngredientPicker
              ingredients={ingredients}
              setIngredients={setIngredients}
              newIngredients={newIngredients}
              setNewIngredients={setNewIngredients}
              selectedIngredients={selectedIngredients}
              setSelectedIngredients={setSelectedIngredients}
            />
            {/* Instructions */}
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Instructions</FormControlLabelText>
              </FormControlLabel>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  setOpenRichText(true);
                  editor.focus(true);
                }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#d3d3d3',
                    borderRadius: 4,
                    borderStyle: 'dashed',
                    marginHorizontal: -28,
                  }}>
                  <WebView
                    originWhitelist={['*']}
                    style={{ height }}
                    scrollEnabled={false}
                    nestedScrollEnabled={false}
                    injectedJavaScript="window.ReactNativeWebView.postMessage(document.body.scrollHeight)"
                    onMessage={onWebViewMessage}
                    source={{
                      html: `<head><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"></head><body>${formData?.instructions}<style>${editorCSS}</style></body>`,
                    }}
                  />
                </View>
              </TouchableOpacity>
              <FormControlError>
                <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
              </FormControlError>
            </FormControl>
            {/* Create Button */}
            <Button
              disabled={loading}
              className="mt-4 h-11 rounded-xl bg-warning-400"
              onPress={handleCreateRecipe}>
              {loading ? <ButtonSpinner color={'white'} /> : null}
              <ButtonText className="text-md ml-4 font-medium">
                {id ? 'Update' : 'Create'} Recipe
              </ButtonText>
            </Button>
          </Box>
        </View>
      </ScrollView>
      <View
        style={{
          display: openRichText ? 'flex' : 'none',
          position: 'absolute',
          backgroundColor: 'rgb(250 249 251)',
          top: insets.top,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
        <View className="h-16 flex-row items-center justify-between">
          <TouchableOpacity
            style={{ paddingHorizontal: 28 }}
            activeOpacity={0.75}
            onPress={() => {
              closeRichText();
            }}>
            <Ionicons name="chevron-down" size={22} color={'rgb(42 48 81)'} />
          </TouchableOpacity>
          <Text className="font-qs-bold text-2xl text-dark">Instructions</Text>
          <View className="mr-7 w-10 items-end">
            {saveIndicator ? (
              <Ionicons size={24} name="save-outline" color={'rgb(42 48 81)'} />
            ) : null}
          </View>
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          {editor ? (
            <>
              <RichText editor={editor} />
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{
                  position: 'absolute',
                  width: '100%',
                  bottom: 0,
                }}>
                <Toolbar editor={editor} />
              </KeyboardAvoidingView>
            </>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateRecipe;
