import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

const ManageCategories = () => {
  const [categories, setCategories] = useState<any>([]);
  const { ifLight } = useGlobalContext();
  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('category').select('*');
    if (data) {
      setCategories(data);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="w-full flex-1 px-7">
          <View className="h-16 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}>
              <Ionicons
                size={24}
                name="chevron-back"
                color={ifLight('rgb(42 48 81)', 'rgb(238 240 255)')}
              />
            </TouchableOpacity>
            <Text className="font-qs-bold text-2xl text-dark">Settings</Text>
            <View className="w-6"></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageCategories;
