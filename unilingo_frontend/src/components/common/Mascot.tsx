import React from 'react';
import { Image, ImageRequireSource, ImageStyle, StyleProp, StyleSheet } from 'react-native';

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
  void animated;

  return (
    <Image
      source={mascotImages[mood]}
      resizeMode="contain"
      style={[
        styles.image,
        style,
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
