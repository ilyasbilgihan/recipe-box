import { View, Text, TouchableOpacity } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '~/context/GlobalProvider';
import { supabase } from '~/utils/supabase';

export default function Profile() {
  const { session } = useGlobalContext();

  const testDatabase = async () => {
    const { data, error } = await supabase
      .from('recipe_ingredient')
      .update({ recipe_id: 1, ingredient_id: 2, amount: 5 })
      .eq('id', 1);
    console.log('error -> ', error);
    console.log('data -> ', data);
  };

  return (
    <>
      <SafeAreaView>
        <View>
          <Text>{session?.user.email}</Text>
          <TouchableOpacity>
            <Text
              onPress={async () => {
                await supabase.auth.signOut();
              }}>
              Logout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text onPress={testDatabase}>Test Database</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
