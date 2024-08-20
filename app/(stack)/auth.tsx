import {
  View,
  Alert,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import React, { useState } from 'react';
import { supabase } from '~/utils/supabase';
import { router, useNavigation } from 'expo-router';
import { useGlobalContext } from '~/context/GlobalProvider';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '~/components/ui/form-control';
import { Input, InputField } from '~/components/ui/input';
import { TabBarIcon } from '~/components/TabBarIcon';
import { Box } from '~/components/ui/box';
import { ButtonSpinner, ButtonText, Button } from '~/components/ui/button';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

const SignIn = () => {
  const [formState, setFormState] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    username: '',
  });
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useGlobalContext();

  async function signInWithEmail() {
    if (formData.email === '' || formData.password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    await signIn({
      email: formData.email,
      password: formData.password,
    });

    router.replace('/');
    setLoading(false);
  }
  async function checkUsername() {
    const { data, error } = await supabase
      .from('profile')
      .select('username')
      .eq('username', formData.username);

    if (error) {
      Alert.alert('Error', 'Something went wrong');
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
      Alert.alert('Error', 'Username already exists');
      setLoading(false);
      return;
    }

    if (formData.email === '' || formData.password === '') {
      Alert.alert('Error', 'Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      Alert.alert('Error', 'Passwords do not match');
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
      Alert.alert(signUpError.message);
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
      Alert.alert('profile Something went wrong. Please try again');
      setLoading(false);
      return;
    }

    setLoading(false);

    router.replace('/');
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
    <ScrollView>
      <View className="flex w-full flex-1 items-center justify-between px-7 font-qs-medium ">
        <Image source={require('~/assets/images/splash.webp')} className="my-12 h-64 w-64" />
        <Box className="flex w-full gap-3 pb-12">
          <FormControl>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Input className="bg-white">
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
                  <FormControlLabelText>Username</FormControlLabelText>
                </FormControlLabel>
                <Input className="bg-white">
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
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Input className="bg-white">
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
                  <FormControlLabelText>Confirm Password</FormControlLabelText>
                </FormControlLabel>
                <Input className="bg-white">
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
            {loading ? <ButtonSpinner color={'white'} /> : null}
            <ButtonText className="text-md ml-4 font-medium">
              {formState === 'login' ? 'Login' : 'Register'}
            </ButtonText>
          </Button>

          <TouchableOpacity
            onPress={() => {
              if (formState === 'login') {
                top.value = withSpring(top.value + 48);
                setFormState('register');
                navigation.setOptions({
                  title: 'Register',
                });
              } else {
                top.value = withSpring(top.value - 48);
                setFormState('login');
                navigation.setOptions({
                  title: 'Login',
                });
              }
            }}>
            <Text className="font-qs-medium">
              {formState === 'login'
                ? "Don't you have an account yet?"
                : 'Already have an account?'}
            </Text>
          </TouchableOpacity>
        </Box>
      </View>
    </ScrollView>
  );
};

export default SignIn;
