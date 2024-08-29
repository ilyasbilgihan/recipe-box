import React, { forwardRef, useCallback, useMemo } from 'react';
import { BottomSheetFooterProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useGlobalContext } from '~/context/GlobalProvider';

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

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const { ifLight } = useGlobalContext();

  return (
    <BottomSheetModal
      backgroundStyle={{ backgroundColor: ifLight('rgb(250 249 251)', 'rgb(40 44 61)') }}
      backdropComponent={CustomBackdrop}
      ref={ref}
      index={1}
      footerComponent={footerComponent}
      snapPoints={snapPts}
      onChange={handleSheetChanges}>
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheetModal>
  );
});

export default BottomSheet;
