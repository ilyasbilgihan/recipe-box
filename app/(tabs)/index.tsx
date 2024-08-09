import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <>
      <SafeAreaView>
        <View>
          <Text className="font-qs-bold text-dark">Spicy Ramen Noodle</Text>
          <Link href="/sign-in">Sign In</Link>
        </View>
      </SafeAreaView>
    </>
  );
}
