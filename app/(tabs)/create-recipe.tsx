import {
  View,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
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

import * as ImagePicker from 'expo-image-picker';
import { TabBarIcon } from '~/components/TabBarIcon';

const Profile = () => {
  const { session } = useGlobalContext();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    instructions: '',
    thumbnail: '',
  });
  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setLoading(false);
      resetFields();
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // fetch ingredients
  }, []);

  const setField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleProfileUpdate = async () => {
    setLoading(true);

    let uploadedImageUrl = null;
    if (image !== undefined) {
      const url = await uploadImageToSupabaseBucket('recipe_images', image);
      uploadedImageUrl = url;
    }

    const { error } = await supabase.from('recipe').insert({
      name: formData.name,
      duration: formData.duration,
      instructions: formData.instructions,
      thumbnail: uploadedImageUrl ? uploadedImageUrl : formData.thumbnail,
      owner_id: session?.user.id,
    });
    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
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

    setImage(undefined);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      // If permission is denied, show an alert
      Alert.alert('Permission Denied', `Sorry, we need camera roll permission to upload images.`);
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].fileSize) {
        if (result.assets[0].fileSize <= 2000000) {
          setImage(result.assets[0]);
          setField('thumbnail', result.assets[0].uri);
        } else {
          Alert.alert('Error', 'Image size should be less than 2MB');
        }
      }
    }
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex w-full flex-1 items-center justify-between px-8">
        <Box className="flex w-full gap-3 pb-12">
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Recipe Name</FormControlLabelText>
            </FormControlLabel>
            <Input>
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
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Thumbnail</FormControlLabelText>
            </FormControlLabel>
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.75}
              className="flex aspect-video w-full border-spacing-2 items-center justify-center overflow-hidden rounded border border-dashed border-outline-300">
              {image ? (
                <Image
                  source={{ uri: image.uri }}
                  className="h-full w-full"
                  style={{ resizeMode: 'cover' }}
                />
              ) : (
                <TabBarIcon name="image" size={32} color="rgb(115 115 115)" />
              )}
            </TouchableOpacity>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Duration</FormControlLabelText>
            </FormControlLabel>
            <Input className="flex flex-row items-center justify-between px-3">
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
            <FormControlLabel>
              <FormControlLabelText>Instructions</FormControlLabelText>
            </FormControlLabel>
            <Textarea>
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
          <Button
            disabled={loading}
            className="mt-4 h-11 rounded-xl bg-warning-400"
            onPress={handleProfileUpdate}>
            {loading ? <ButtonSpinner color={'white'} /> : null}
            <ButtonText className="text-md ml-4 font-medium">Save</ButtonText>
          </Button>
        </Box>
      </View>
    </ScrollView>
  );
};

export default Profile;
