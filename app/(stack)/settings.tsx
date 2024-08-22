import {
  View,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase, uploadImageToSupabaseBucket } from '~/utils/supabase';
import { Link, router } from 'expo-router';
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
import useImagePicker from '~/utils/useImagePicker';

import * as ImagePicker from 'expo-image-picker';
import LazyImage from '~/components/LazyImage';

const Profile = () => {
  const { session } = useGlobalContext();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    profession: '',
    bio: '',
    profile_image: '',
  });

  const { image, setImage, pickImage } = useImagePicker();
  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchProfile();
      setLoading(false);
      setImage(undefined);
      setRefreshing(false);
    }, 1000);
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', session?.user.id)
      .single();

    if (error) {
      console.log('error', error);
      return;
    }

    if (data) {
      setFormData({
        name: data.name,
        location: data.location,
        profession: data.profession,
        bio: data.bio,
        profile_image: data.profile_image
          ? data.profile_image + '?time=' + new Date().getTime() // Add timestamp to prevent caching
          : '',
      });
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const setField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleProfileUpdate = async () => {
    setLoading(true);

    let uploadedImageUrl = null;
    if (image !== undefined) {
      const url = await uploadImageToSupabaseBucket('profile_images', image);
      uploadedImageUrl = url;
    }

    const { error } = await supabase
      .from('profile')
      .update({
        name: formData.name,
        location: formData.location,
        profession: formData.profession,
        bio: formData.bio,
        profile_image: uploadedImageUrl ? uploadedImageUrl : formData.profile_image,
      })
      .eq('id', session?.user.id);

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert('Success', 'Profile updated successfully');
    router.push('/profile');
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex w-full flex-1 items-center justify-between px-7 font-qs-medium ">
        <View className="my-12 flex flex-col gap-3">
          <TouchableOpacity onPress={pickImage}>
            <LazyImage
              source={
                image
                  ? { uri: image.uri }
                  : formData.profile_image
                    ? { uri: formData.profile_image }
                    : require('~/assets/images/no-image.png')
              }
              className="h-32 w-32 rounded-full bg-outline-100"
            />
          </TouchableOpacity>
          {formData.profile_image ? (
            <TouchableOpacity
              onPress={() => {
                setField('profile_image', '');
                setImage(undefined);
              }}>
              <Text className="font-qs-medium font-semibold text-red-700">Remove Image</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Box className="flex w-full gap-3 pb-12">
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Name</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type="text"
                defaultValue={formData.name}
                onChange={(e) => setField('name', e.nativeEvent.text)}
                placeholder="Jane Doe"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Location</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type="text"
                defaultValue={formData.location}
                onChange={(e) => setField('location', e.nativeEvent.text)}
                placeholder="İstanbul, Türkiye"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Profession</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField
                type="text"
                defaultValue={formData.profession}
                onChange={(e) => setField('profession', e.nativeEvent.text)}
                placeholder="Cook"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl>
            <FormControlLabel>
              <FormControlLabelText>Bio</FormControlLabelText>
            </FormControlLabel>
            <Textarea>
              <TextareaInput
                numberOfLines={5}
                defaultValue={formData.bio}
                onChange={(e) => setField('bio', e.nativeEvent.text)}
                textAlignVertical="top"
                placeholder="Once upon a time..."
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
