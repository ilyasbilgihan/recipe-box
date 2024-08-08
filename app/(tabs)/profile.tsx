import { Link, router, Stack } from 'expo-router';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '~/context/GlobalProvider';
import { supabase } from '~/utils/supabase';

export default function Profile() {
  const { session } = useGlobalContext();

  return (
    <>
      <SafeAreaView>
        <View>
          <Text>{session?.user.email}</Text>
          <TouchableOpacity>
            <Text
              onPress={async () => {
                await supabase.auth.signOut();
                router.replace('/sign-in');
              }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
