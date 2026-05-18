import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

type AppBackgroundProps = {
  children: React.ReactNode;
};

export default function AppBackground({ children }: AppBackgroundProps) {
  return (
    <ImageBackground
      source={require('../../../background.png')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
});
