import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key: string) {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
