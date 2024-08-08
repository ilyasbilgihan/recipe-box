import { View, Alert, StyleSheet, Text } from 'react-native';
import { useState } from 'react';
import { supabase } from '~/utils/supabase';
import { TextInput, Button } from 'react-native';
import { Link, router } from 'expo-router';
import { useGlobalContext } from '~/context/GlobalProvider';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading } = useGlobalContext();

  async function signUpWithEmail() {
    await signUp({
      email: email,
      password: password,
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setConfirmPassword(text)}
          value={confirmPassword}
          secureTextEntry={true}
          placeholder="Confirm Pasword"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign Up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
      <View>
        <Link href="/sign-in">Already have an account?</Link>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});

export default SignUp;
