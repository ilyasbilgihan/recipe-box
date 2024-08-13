import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

export default function Home() {
  const { session } = useGlobalContext();
  const testDatabase = async () => {
    const res = await supabase
      .from('profile')
      .update({
        role: 'admin',
      })
      .eq('id', session?.user.id)
      .select('role');
    console.log(res);
  };

  return (
    <>
      <SafeAreaView>
        <View>
          <TouchableOpacity onPress={testDatabase}>
            <Text className="font-qs-bold text-4xl text-dark">TEST DATABASE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
