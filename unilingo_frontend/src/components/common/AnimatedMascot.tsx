import React, { useEffect } from 'react';
import { ImageStyle, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(translateY);
    cancelAnimation(translateX);
    cancelAnimation(scale);
    cancelAnimation(rotation);

    translateY.value = 0;
    translateX.value = 0;
    scale.value = 1;
    rotation.value = 0;

    switch (state) {
      case 'speaking':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 220, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 180, easing: Easing.out(Easing.quad) }),
            withTiming(0.98, { duration: 160, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case 'happy':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-22, { duration: 240, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 280, easing: Easing.bounce })
          ),
          -1,
          false
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 220, easing: Easing.out(Easing.quad) }),
            withTiming(0.98, { duration: 180, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
        rotation.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 260, easing: Easing.inOut(Easing.quad) }),
            withTiming(4, { duration: 260, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 160, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case 'sad':
        translateX.value = withSequence(
          withTiming(-8, { duration: 80, easing: Easing.linear }),
          withTiming(8, { duration: 80, easing: Easing.linear }),
          withTiming(-6, { duration: 80, easing: Easing.linear }),
          withTiming(6, { duration: 80, easing: Easing.linear }),
          withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) })
        );
        rotation.value = withSequence(
          withTiming(-3, { duration: 80, easing: Easing.linear }),
          withTiming(3, { duration: 80, easing: Easing.linear }),
          withTiming(-2, { duration: 80, easing: Easing.linear }),
          withTiming(2, { duration: 80, easing: Easing.linear }),
          withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) })
        );
        break;

      case 'jump':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-34, { duration: 260, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 320, easing: Easing.bounce }),
            withTiming(0, { duration: 180 })
          ),
          -1,
          false
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.12, { duration: 220, easing: Easing.out(Easing.quad) }),
            withTiming(0.94, { duration: 140, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case 'idle':
      default:
        translateY.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
            withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;
    }

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(scale);
      cancelAnimation(rotation);
    };
  }, [rotation, scale, state, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.Image
      source={mascotSource}
      resizeMode="contain"
      style={[
        styles.image,
        style as StyleProp<ImageStyle>,
        { width: size, height: size },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
