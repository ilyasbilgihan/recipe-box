import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from './ui/select';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '~/components/ui/form-control';

type Category = {
  id: number;
  name: string;
};

const CategoryPicker = ({
  categories,
  selectedCategories,
  setSelectedCategories,
}: {
  categories: Category[];
  selectedCategories: Category[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}) => {
  return (
    <FormControl>
      <FormControlLabel className="mb-1">
        <FormControlLabelText>Category</FormControlLabelText>
      </FormControlLabel>
      <Select
        onValueChange={(value) => {
          let isExist = selectedCategories.find(({ id }) => id === +value);
          if (!isExist) {
            setSelectedCategories([
              ...selectedCategories,
              { id: +value, name: categories.find(({ id }) => id === +value)!?.name },
            ]);
          }
          console.log('category changed -> ', value);
        }}>
        <View className=" flex flex-row items-center rounded-md border border-outline-300 bg-white">
          <View className="flex flex-1 flex-row flex-wrap gap-2  p-3 text-typography-600">
            {selectedCategories.length > 0 ? (
              selectedCategories.map(({ id, name }) => (
                <TouchableOpacity
                  style={{ zIndex: 10 }}
                  activeOpacity={0.75}
                  onPress={(e) => {
                    let filtered = selectedCategories.filter((item) => item.id !== id);
                    setSelectedCategories(filtered);
                  }}
                  key={id}>
                  <Text className="rounded-md border border-dashed border-outline-300 px-3 py-2">
                    {name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-sm text-typography-600">No Category</Text>
            )}
          </View>
          <SelectTrigger className="h-10 w-10 items-center justify-center border-0 " size="md">
            <View>
              <Ionicons name="chevron-down" size={14} color={'#737373'} />
            </View>
          </SelectTrigger>
        </View>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {categories.map(({ id, name }) => (
              <SelectItem key={id} label={name} value={'' + id} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
      <FormControlError>
        <FormControlErrorText>At least 6 characters are required.</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default CategoryPicker;
