import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useGlobalContext } from '~/context/GlobalProvider';

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
import { FormControl, FormControlLabel, FormControlLabelText } from '~/components/ui/form-control';
import { useTranslation } from 'react-i18next';

const Picker = ({
  items,
  selectedItems,
  setSelectedItems,
  disabled,
  noItemText,
  label,
}: {
  items: any[];
  selectedItems: any[];
  setSelectedItems: React.Dispatch<React.SetStateAction<any[]>>;
  disabled?: boolean;
  noItemText: string;
  label: string;
}) => {
  const { t } = useTranslation();
  const { ifLight } = useGlobalContext();

  return (
    <FormControl style={disabled ? { opacity: 0.4 } : {}}>
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      <Select
        isDisabled={disabled}
        onValueChange={(value) => {
          let isExist = selectedItems.find(({ id }) => id === +value);
          if (!isExist) {
            setSelectedItems([
              ...selectedItems,
              { id: +value, name: items.find(({ id }) => id === +value)!?.name },
            ]);
          }
          console.log('category changed -> ', value);
        }}>
        <View className="flex flex-row items-center rounded-md border border-outline-200 bg-back dark:border-transparent dark:focus:border-stone-800">
          <View className="flex flex-1 flex-row flex-wrap gap-2  p-3 text-typography-600">
            {selectedItems.length > 0 ? (
              selectedItems.map(({ id, name }) => (
                <TouchableOpacity
                  style={{ zIndex: 10 }}
                  activeOpacity={disabled ? 1 : 0.75}
                  onPress={(e) => {
                    if (disabled) return;
                    let filtered = selectedItems.filter((item) => item.id !== id);
                    setSelectedItems(filtered);
                  }}
                  key={id}>
                  <Text className="rounded-md border border-dashed border-outline-200 px-3 py-2 text-typography-600">
                    {name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-sm text-typography-500">{noItemText}</Text>
            )}
          </View>
          <SelectTrigger className="h-10 w-10 items-center justify-center border-0 " size="md">
            <View>
              <Ionicons
                name="chevron-down"
                size={14}
                color={ifLight('rgb(140 140 140)', 'rgb(163 163 163)')}
              />
            </View>
          </SelectTrigger>
        </View>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {items.map(({ id, name }) => (
              <SelectItem key={id} label={name} value={'' + id} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </FormControl>
  );
};

export default Picker;
