import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';

import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const ImagePickerInput = ({
  image,
  pickImage,
  defaultImage,
}: {
  image: ImagePicker.ImagePickerAsset | undefined;
  pickImage: () => void;
  defaultImage?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={pickImage}
      activeOpacity={0.75}
      className="flex aspect-square w-full border-spacing-2 items-center justify-center overflow-hidden rounded border border-dashed border-outline-200">
      {image ? (
        <Image
          source={{ uri: image.uri }}
          className="h-full w-full"
          style={{ resizeMode: 'cover' }}
        />
      ) : defaultImage ? (
        <Image
          source={{ uri: defaultImage }}
          className="h-full w-full"
          style={{ resizeMode: 'cover' }}
        />
      ) : (
        <Ionicons name="image-outline" size={32} color="rgb(115 115 115)" />
      )}
    </TouchableOpacity>
  );
};

export default ImagePickerInput;
