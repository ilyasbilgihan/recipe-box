import React, { useMemo, useState } from 'react';
import { View, Image, ActivityIndicator, ImageBackground } from 'react-native';

const LazyImage = ({ background, ...props }: any) => {
  const [loading, setLoading] = useState(true);

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const memorizedImage = useMemo(() => {
    if (!background) {
      return (
        <Image
          {...props}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoad={handleLoad}
        />
      );
    } else {
      if (props.source.uri) {
        return (
          <ImageBackground
            {...props}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onLoad={handleLoad}>
            {props.children}
          </ImageBackground>
        );
      }
    }
  }, [props.source]);

  return (
    <View style={props.style} className={`${props.className} relative items-center justify-center`}>
      {loading && <ActivityIndicator color="#FCA020" size="large" className="absolute z-10" />}
      {memorizedImage}
    </View>
  );
};

export default LazyImage;
