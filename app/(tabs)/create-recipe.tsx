import {
  View,
  Alert,
  ScrollView,
  RefreshControl,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
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

import ImagePickerInput from '~/components/ImagePickerInput';
import useImagePicker from '~/utils/useImagePicker';
import { RichText, TenTapStartKit, Toolbar, useEditorBridge } from '@10play/tentap-editor';

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

type Category = {
  id: number;
  name: string;
};

import IngredientPicker from '~/components/IngredientPicker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { editorCSS } from '~/utils/editorCSS';

import CategoryPicker from '~/components/CategoryPicker';
import WebView, { WebViewMessageEvent } from 'react-native-webview';

const CreateRecipe = () => {
  const { session } = useGlobalContext();
  const navigation = useNavigation();
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
  const [openRichText, setOpenRichText] = React.useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const timeout = useRef<any>(null);

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

  const editor = useEditorBridge({
    autofocus: false,
    bridgeExtensions: TenTapStartKit,
    avoidIosKeyboard: true,
    theme: {
      webview: {
        backgroundColor: '#FAF9FB',
      },
    },
    initialContent:
      formData.instructions.length > 0 ? formData.instructions : `<p>Add your instructions</p>`,
    onChange: async () => {
      // debounce
      clearTimeout(timeout.current);
      timeout.current = setTimeout(async () => {
        let content = await editor.getHTML();
        setField('instructions', content);
        navigation.setOptions({
          headerRight: () =>
            content ? (
              <View className="mr-7">
                <Ionicons size={24} name="save-outline" color={'rgb(42 48 81)'} />
              </View>
            ) : null,
        });
        setTimeout(() => {
          navigation.setOptions({
            headerRight: () => null,
          });
        }, 1000);
      }, 2000);
    },
  });

  useEffect(() => {
    // fetch ingredients

    fetchIngredients();

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

    if (categories.length > 0) {
      let categoryToInsert: {
        category_id: number;
        recipe_id: any;
      }[] = [];
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        categoryToInsert.push({
          category_id: category.id,
          recipe_id: data.id,
        });
      }
      const { data: catData, error: catError } = await supabase
        .from('recipe_category')
        .insert(categoryToInsert);
      console.log('catData ->', catData);
      console.log('catError ->', catError);
    }

    setLoading(false);
    Alert.alert('Success', 'Recipe Created Successfully');
    resetFields();
    router.push('/');
  };

  const resetFields = () => {
    setFormData({
      name: '',
      duration: '',
      instructions: `<p>Add your instructions</p>`,
      thumbnail: '',
    });
    editor.setContent('');
    setCategories([]);
    setHeight(50);
    setSelectedIngredients([]);
    setImage(undefined);
  };

  const [height, setHeight] = useState(50);

  const onWebViewMessage = (event: WebViewMessageEvent) => {
    console.log(event.nativeEvent);
    setHeight(+event.nativeEvent.data);
  };

  return (
    <>
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
            {/* Category */}
            <CategoryPicker selectedCategories={categories} setSelectedCategories={setCategories} />
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

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  console.log('open portal');
                  navigation.setOptions({
                    title: 'Instructions',
                    headerLeft: () => (
                      <TouchableOpacity
                        style={{ marginLeft: 8, padding: 20 }}
                        activeOpacity={0.75}
                        onPress={() => {
                          closeRichText();
                        }}>
                        <Ionicons name="chevron-back" size={22} color={'rgb(42 48 81)'} />
                      </TouchableOpacity>
                    ),
                  });
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
              <ButtonText className="text-md ml-4 font-medium">Create Recipe</ButtonText>
            </Button>
          </Box>
        </View>
      </ScrollView>
      <View
        style={{
          display: openRichText ? 'flex' : 'none',
          position: 'absolute',
          backgroundColor: 'rgb(250 249 251)',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
        <View style={{ flex: 1, width: '100%' }}>
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
        </View>
      </View>
    </>
  );
};

export default CreateRecipe;
