/**
 * SplashScreen — Homepage with UNILINGO branding
 * Auto-navigates to Auth/Main after 4 seconds
 */
import React, { useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useAuthStore } from '../store/authStore';

type Props = {
  navigation: any;
};

export default function SplashScreen({ navigation }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { width, height } = useWindowDimensions();

  // Responsive font sizing
  const fontSize = Math.min(width * 0.13, 60);
  const letterSpacing = Math.min(width * 0.018, 8);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to Auth or Main based on authentication state
      // Using replace to prevent back navigation to splash screen
      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Auth');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated]);

  return (
    <ImageBackground
      source={require('../../homepage.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text
          style={[
            styles.logo,
            {
              fontSize,
              letterSpacing,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          allowFontScaling={false}
        >
          UNILINGO
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: '100%',
    textAlign: 'center',
    color: '#3350B2',
    fontWeight: '700',
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
});
