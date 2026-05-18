import React, { useEffect } from 'react';
import { ImageRequireSource, ImageStyle, StyleProp, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export type MascotMood =
  | 'idle'
  | 'surprised'
  | 'sad'
  | 'happy'
  | 'laugh'
  | 'closedEyes'
  | 'confused'
  | 'cheer'
  | 'sit'
  | 'lie'
  | 'run'
  | 'jump';

type MascotProps = {
  mood?: MascotMood;
  size?: number;
  animated?: boolean;
  style?: StyleProp<ImageStyle>;
};

const mascotImages: Record<MascotMood, ImageRequireSource> = {
  idle: require('../../../assets/mascot/mascot_sit.png'),
  surprised: require('../../../assets/mascot/mascot_surprised.png'),
  sad: require('../../../assets/mascot/mascot_sad.png'),
  happy: require('../../../assets/mascot/mascot_happy.png'),
  laugh: require('../../../assets/mascot/mascot_happy.png'),
  closedEyes: require('../../../assets/mascot/mascot_closed_eyes.png'),
  confused: require('../../../assets/mascot/mascot_surprised.png'),
  cheer: require('../../../assets/mascot/mascot_cheer.png'),
  sit: require('../../../assets/mascot/mascot_sit.png'),
  lie: require('../../../assets/mascot/mascot_lie.png'),
  run: require('../../../assets/mascot/mascot_run.png'),
  jump: require('../../../assets/mascot/mascot_jump.png'),
};

export default function Mascot({
  mood = 'idle',
  size = 140,
  animated = true,
  style,
}: MascotProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(scale);
    cancelAnimation(rotation);

    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    rotation.value = 0;

    if (!animated) return;

    switch (mood) {
      case 'happy':
      case 'laugh':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 280, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 320, easing: Easing.bounce })
          ),
          -1,
          false
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 260, easing: Easing.out(Easing.quad) }),
            withTiming(0.99, { duration: 220, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case 'cheer':
      case 'jump':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-28, { duration: 260, easing: Easing.out(Easing.cubic) }),
            withTiming(0, { duration: 340, easing: Easing.bounce }),
            withTiming(0, { duration: 180 })
          ),
          -1,
          false
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 240, easing: Easing.out(Easing.quad) }),
            withTiming(0.95, { duration: 160, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case 'confused':
        rotation.value = withRepeat(
          withSequence(
            withTiming(-7, { duration: 300, easing: Easing.inOut(Easing.quad) }),
            withTiming(7, { duration: 300, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case 'sad':
        translateY.value = withRepeat(
          withSequence(
            withTiming(8, { duration: 900, easing: Easing.inOut(Easing.sin) }),
            withTiming(3, { duration: 900, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        scale.value = withTiming(0.98, { duration: 700, easing: Easing.out(Easing.quad) });
        break;

      case 'closedEyes':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.025, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;

      case 'run':
        translateX.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 120, easing: Easing.linear }),
            withTiming(5, { duration: 120, easing: Easing.linear }),
            withTiming(0, { duration: 120, easing: Easing.linear })
          ),
          -1,
          false
        );
        translateY.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 160, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case 'sit':
      case 'lie':
      case 'surprised':
        scale.value = withTiming(1, { duration: 200 });
        break;

      case 'idle':
      default:
        scale.value = withRepeat(
          withSequence(
            withTiming(1.03, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;
    }

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(rotation);
    };
  }, [animated, mood, rotation, scale, translateX, translateY]);

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
      source={mascotImages[mood]}
      resizeMode="contain"
      style={[
        styles.image,
        style,
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
