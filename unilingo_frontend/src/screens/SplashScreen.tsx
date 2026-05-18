/**
 * SplashScreen — App Intro (Homepage)
 * Displays only the homepage artwork and auto-navigates to AuthChoice after 3 seconds.
 * No buttons here, and no extra mascot render if the background already contains one.
 */
import React, { useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  navigation: any;
};

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    console.log('Splash mounted');
    const timer = setTimeout(() => {
      console.log('Go to AuthChoice');
      navigation.replace('AuthChoice');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ImageBackground
        source={require('../../homepage.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
          <Text style={styles.mainLogo} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} allowFontScaling={false}>
            UNILINGO
          </Text>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainLogo: {
    color: '#F6D85F',
    fontSize: 68,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
    textShadowColor: '#9CA3AF',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
});
