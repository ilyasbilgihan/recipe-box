import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <SafeAreaView>
        <Text>Home</Text>
        <Link href="/sign-in">Sign In</Link>
      </SafeAreaView>
    </>
  );
}
