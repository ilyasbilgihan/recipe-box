import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

import { supabase, uploadImageToSupabaseBucket, deleteImage } from '~/utils/supabase';
import useImagePicker from '~/utils/useImagePicker';
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
import LazyImage from '~/components/LazyImage';
import useCustomToast from '~/components/useCustomToast';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const ProfileDetail = () => {
  const { t } = useTranslation();
  const { session, ifLight } = useGlobalContext();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    profession: '',
    bio: '',
    profile_image: '',
  });

  const { image, setImage, pickImage } = useImagePicker();
  const [loading, setLoading] = useState(false);
  const [tempImage, setTempImage] = useState('');
  const toast = useCustomToast();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setLoading(false);
    await fetchProfile();
    setImage(undefined);
    setRefreshing(false);
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
      if (data.profile_image !== null || data.profile_image) {
        setTempImage(data.profile_image.split('profile_images/')[1]);
      }
      setFormData({
        name: data.name,
        location: data.location,
        profession: data.profession,
        bio: data.bio,
        profile_image: data.profile_image || '',
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
      const { url, error } = await uploadImageToSupabaseBucket('profile_images', image);
      if (error) {
        toast.error(t('image_upload_error') + error.message);
      } else {
        uploadedImageUrl = url;
      }
    }

    // if there is a new image or user wants to delete own image
    if (uploadedImageUrl || formData.profile_image == '') {
      // delete image from bucket
      if (tempImage) {
        const { error } = await deleteImage('profile_images/' + tempImage);
        if (error) {
          toast.error(t('image_delete_error') + error.message);
        }
      }
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
      toast.error(t('something_went_wrong') + error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success(t('profile_update_success'));
    router.push('/profile');
  };

  return (
    <SafeAreaView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="flex w-full flex-1 px-7 font-qs-medium ">
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
            <Text className="font-qs-bold text-2xl text-dark">{t('settings')}</Text>
            <View className="h-6 w-6"></View>
          </View>
          <View className="my-12 flex flex-col items-center gap-3">
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
            {formData.profile_image || image ? (
              <TouchableOpacity
                onPress={() => {
                  setField('profile_image', '');
                  setImage(undefined);
                }}>
                <Text className="font-qs-medium font-semibold text-error-500">
                  {t('remove_image')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Box className="flex w-full gap-3 pb-12">
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>{t('profile_name')}</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="text"
                  defaultValue={formData.name}
                  onChange={(e) => setField('name', e.nativeEvent.text)}
                  placeholder={t('name_placeholder')}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>{t('location')}</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="text"
                  defaultValue={formData.location}
                  onChange={(e) => setField('location', e.nativeEvent.text)}
                  placeholder={t('location_placeholder')}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>{t('profession')}</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="text"
                  defaultValue={formData.profession}
                  onChange={(e) => setField('profession', e.nativeEvent.text)}
                  placeholder={t('profession_placeholder')}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>{t('bio')}</FormControlLabelText>
              </FormControlLabel>
              <Textarea>
                <TextareaInput
                  numberOfLines={5}
                  defaultValue={formData.bio}
                  onChange={(e) => setField('bio', e.nativeEvent.text)}
                  textAlignVertical="top"
                  placeholder={t('bio_placeholder')}
                  className="p-3"
                />
              </Textarea>
            </FormControl>
            <Button
              disabled={loading}
              className="mt-4 h-11 rounded-xl bg-warning-400"
              onPress={handleProfileUpdate}>
              {loading ? <ButtonSpinner color={'rgb(255 249 245)'} /> : null}
              <ButtonText className="text-md ml-4 font-medium text-warning-50">
                {t('save')}
              </ButtonText>
            </Button>
          </Box>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileDetail;
