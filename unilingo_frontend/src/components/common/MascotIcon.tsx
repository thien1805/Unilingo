import React from 'react';
import { Image, ImageRequireSource, StyleSheet } from 'react-native';

export type MascotIconMood =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'confused'
  | 'cheer'
  | 'surprised'
  | 'laugh'
  | 'closedEyes'
  | 'jump';

type MascotIconProps = {
  mood?: MascotIconMood;
  size?: number;
};

const mascotIconImages: Record<MascotIconMood, ImageRequireSource> = {
  idle: require('../../../assets/mascot/mascot_sit.png'),
  happy: require('../../../assets/mascot/mascot_happy.png'),
  sad: require('../../../assets/mascot/mascot_sad.png'),
  confused: require('../../../assets/mascot/mascot_surprised.png'),
  cheer: require('../../../assets/mascot/mascot_cheer.png'),
  surprised: require('../../../assets/mascot/mascot_surprised.png'),
  laugh: require('../../../assets/mascot/mascot_happy.png'),
  closedEyes: require('../../../assets/mascot/mascot_closed_eyes.png'),
  jump: require('../../../assets/mascot/mascot_jump.png'),
};

export default function MascotIcon({ mood = 'idle', size = 28 }: MascotIconProps) {
  return (
    <Image
      source={mascotIconImages[mood]}
      resizeMode="contain"
      style={[styles.image, { width: size, height: size }]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    flexShrink: 0,
  },
});
