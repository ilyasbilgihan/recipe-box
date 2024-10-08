import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Redirect, router, useNavigation } from 'expo-router';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useGlobalContext } from '~/context/GlobalProvider';

import { supabase } from '~/utils/supabase';
import { useTranslation } from 'react-i18next';

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
import useCustomToast from '~/components/useCustomToast';
import { SafeAreaView } from 'react-native-safe-area-context';

const SignIn = () => {
  const { session, ifLight } = useGlobalContext();
  if (session) return <Redirect href="/" />;

  const [formState, setFormState] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    username: '',
  });
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const toast = useCustomToast();

  const { t } = useTranslation();

  async function signInWithEmail() {
    if (formData.email === '' || formData.password === '') {
      toast.warning(t('fill_all_fields'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) toast.error(error.message);

    router.push('/');
    setLoading(false);
  }
  async function checkUsername() {
    const { data, error } = await supabase
      .from('profile')
      .select('username')
      .eq('username', formData.username);

    if (error) {
      toast.error(t('something_went_wrong') + error.message);
      setLoading(false);
      return;
    }
    if (data?.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async function signUpWithEmail() {
    setLoading(true);

    const usernameExists = await checkUsername();

    if (usernameExists) {
      toast.warning(t('username_exists'));
      setLoading(false);
      return;
    }

    if (formData.email === '' || formData.password === '') {
      toast.warning(t('fill_all_fields'));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.warning(t('passwords_do_not_match'));
      setLoading(false);
      return;
    }

    const {
      data: { session },
      error: signUpError,
    } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (signUpError) {
      toast.error(t('something_went_wrong') + signUpError.message);
      setLoading(false);
      return;
    }
    const { data, error: profileError } = await supabase.from('profile').insert({
      username: formData.username,
      id: session?.user.id,
      email: session?.user.email,
      role: 'admin', // test
    });

    if (profileError) {
      console.log(session?.user.email);
      console.log(profileError);
      toast.error(t('something_went_wrong') + profileError);
      setLoading(false);
      return;
    }

    setLoading(false);

    //router.push('/');
  }

  const setField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  const top = useSharedValue(-48);

  const handleAuth = () => {
    if (formState === 'login') {
      signInWithEmail();
    } else {
      signUpWithEmail();
    }
  };

  return (
    <SafeAreaView>
      <View className="h-16 flex-row items-center justify-center px-7">
        <Text className="font-qs-bold text-2xl text-dark">
          {formState === 'login' ? t('login') : t('register')}
        </Text>
      </View>
      <ScrollView>
        <View className="flex w-full flex-1 items-center justify-between px-7 font-qs-medium ">
          <Image source={require('~/assets/images/splash.webp')} className="my-12 h-64 w-64" />
          <Box className="flex w-full gap-3 pb-12">
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>{t('email')}</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="text"
                  defaultValue={formData.email}
                  onChange={(e) => setField('email', e.nativeEvent.text)}
                  placeholder="janedoe@mail.com"
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
              </FormControlError>
            </FormControl>
            {formState === 'register' && (
              <Animated.View
                style={{
                  top,
                }}>
                <FormControl>
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>{t('username')}</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      type="text"
                      defaultValue={formData.username}
                      onChange={(e) => setField('username', e.nativeEvent.text)}
                      placeholder="jane_doe"
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </Animated.View>
            )}
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>{t('password')}</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type="password"
                  defaultValue={formData.password}
                  onChange={(e) => setField('password', e.nativeEvent.text)}
                  placeholder="********"
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
              </FormControlError>
            </FormControl>
            {formState === 'register' && (
              <Animated.View
                style={{
                  top,
                }}>
                <FormControl>
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>{t('confirm_password')}</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      type="password"
                      defaultValue={formData.confirm_password}
                      onChange={(e) => setField('confirm_password', e.nativeEvent.text)}
                      placeholder="********"
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </Animated.View>
            )}
            <Button
              disabled={loading}
              className="mt-4 h-11 rounded-xl  bg-warning-400"
              onPress={handleAuth}>
              {loading ? <ButtonSpinner color="rgb(255 249 245)" /> : null}
              <ButtonText className="text-md ml-4 font-medium text-warning-50">
                {formState === 'login' ? t('login') : t('register')}
              </ButtonText>
            </Button>

            <TouchableOpacity
              onPress={() => {
                if (formState === 'login') {
                  top.value = withSpring(top.value + 48);
                  setFormState('register');
                } else {
                  top.value = withSpring(top.value - 48);
                  setFormState('login');
                }
              }}>
              <Text className="font-qs-medium text-dark">
                {formState === 'login' ? t('no_account_yet') : t('already_have_an_account')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.push('/downloaded-recipes');
              }}>
              <Text className="font-qs-medium text-dark">{t('see_downloaded')}</Text>
            </TouchableOpacity>
          </Box>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
