import { View, Alert, Image, ScrollView, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
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

const Profile = () => {
  const { session } = useGlobalContext();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    profession: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchProfile();
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

    const { error } = await supabase
      .from('profile')
      .update({
        name: formData.name,
        location: formData.location,
        profession: formData.profession,
        bio: formData.bio,
      })
      .eq('id', session?.user.id);

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert('Success', 'Profile updated successfully');
    router.replace('/profile');
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex w-full flex-1 items-center justify-between px-12 font-qs-medium ">
        <Image source={require('~/assets/images/user.png')} className="my-12 h-32 w-32" />
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
