import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { BottomSheetFooterProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useGlobalContext } from '~/context/GlobalProvider';
import { useFocusEffect } from 'expo-router';
import { BackHandler } from 'react-native';

const CustomBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle]
  );

  return <Animated.View style={containerStyle} />;
};

const BottomSheet = forwardRef<
  BottomSheetModal,
  {
    footerComponent?: React.FC<BottomSheetFooterProps> | undefined;
    snapPoints: string[];
    children: React.ReactNode;
  }
>(({ footerComponent, snapPoints, children }, ref) => {
  const snapPts = useMemo(() => snapPoints, []);

  const [currentState, setCurrentState] = useState<number>(-1);
  const handleSheetChanges = useCallback((index: number) => {
    setCurrentState(index);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentState != -1 && ref) {
          //@ts-ignore
          ref?.current?.close();
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [ref, currentState])
  );

  const { ifLight } = useGlobalContext();

  return (
    <BottomSheetModal
      backgroundStyle={{ backgroundColor: ifLight('rgb(250 249 251)', 'rgb(40 44 61)') }}
      backdropComponent={CustomBackdrop}
      ref={ref}
      handleIndicatorStyle={{ backgroundColor: ifLight('rgb(42 48 81)', 'rgb(162 163 163)') }}
      index={1}
      footerComponent={footerComponent}
      snapPoints={snapPts}
      onChange={handleSheetChanges}>
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});

export default BottomSheet;
