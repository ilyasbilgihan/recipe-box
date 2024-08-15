import 'react-native-get-random-values';
import { Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { ImagePickerAsset } from 'expo-image-picker';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
import { decode } from 'base64-arraybuffer';
import { nanoid } from 'nanoid';

export const uploadImageToSupabaseBucket = async (location: string, uploaded: ImagePickerAsset) => {
  const bucket = 'recipe-box';
  const base64 = uploaded.base64;
  const unique = nanoid();
  const filePath = `${location}/${unique}.${uploaded.uri.split('.').pop()}`;

  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, decode(base64!), {
      contentType: 'image/*',
      upsert: true,
    });

  if (uploadError) {
    Alert.alert('Error', uploadError.message);
    return;
  }

  // Construct public URL
  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${data.path}`;

  return url;
};
