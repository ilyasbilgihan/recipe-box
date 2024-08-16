import React, { forwardRef, useCallback, useMemo } from 'react';
import { BottomSheetFooterProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

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

  return (
    <BottomSheetModal
      backgroundStyle={{ backgroundColor: '#FAF9FB' }}
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
