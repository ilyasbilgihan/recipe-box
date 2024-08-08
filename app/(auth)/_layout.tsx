import { View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="sign-in"
          options={{
            title: 'Sign In',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            title: 'Sign Up',
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar backgroundColor="white" />
    </>
  );
}
