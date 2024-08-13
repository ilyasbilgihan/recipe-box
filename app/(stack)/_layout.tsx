import { StatusBar, View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <>
      <Stack screenOptions={{ contentStyle: { backgroundColor: '#FAF9FB' } }}>
        <Stack.Screen
          name="auth"
          options={{
            title: 'Login',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: '#FAF9FB',
            },
            headerTitleStyle: {
              fontFamily: 'Quicksand SemiBold',
            },
            headerTitleAlign: 'center',
          }}
        />
      </Stack>
      <StatusBar backgroundColor="#FAF9FB" />
    </>
  );
}
