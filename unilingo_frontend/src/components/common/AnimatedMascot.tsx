import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, ViewStyle } from 'react-native';

export type AnimatedMascotState = 'idle' | 'speaking' | 'happy' | 'sad' | 'jump';

type AnimatedMascotProps = {
  state?: AnimatedMascotState;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const mascotSource = require('../../../assets/images/uni_icon.png');

export default function AnimatedMascot({
  state = 'idle',
  size = 140,
  style,
}: AnimatedMascotProps) {
  void state;

  return (
    <Image
      source={mascotSource}
      resizeMode="contain"
      style={[
        styles.image,
        style as StyleProp<ImageStyle>,
        { width: size, height: size },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
