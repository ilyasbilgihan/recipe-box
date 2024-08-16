import { Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function useImagePicker(aspect = <[number, number]>[1, 1], maxSize = 2000000) {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      // If permission is denied, show an alert
      Alert.alert('Permission Denied', `Sorry, we need camera roll permission to upload images.`);
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspect,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].fileSize) {
        if (result.assets[0].fileSize <= maxSize) {
          setImage(result.assets[0]);
        } else {
          Alert.alert('Error', 'Image size should be less than 2MB');
        }
      }
    }
  };

  return { image, pickImage, setImage };
}
