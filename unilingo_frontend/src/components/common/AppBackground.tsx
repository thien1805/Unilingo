import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

type AppBackgroundProps = {
  children: React.ReactNode;
};

export default function AppBackground({ children }: AppBackgroundProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../background.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
});