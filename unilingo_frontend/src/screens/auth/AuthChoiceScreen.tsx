/**
 * AuthChoiceScreen — Welcome screen with Sign In / Sign Up options
 * Clean auth-only layout with no homepage background image.
 */
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AnimatedMascot from '../../components/common/AnimatedMascot';
import AppBackground from '../../components/common/AppBackground';

type Props = {
  navigation: any;
};

export default function AuthChoiceScreen({ navigation }: Props) {
  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.smallLogo}>UNILINGO</Text>

          <AnimatedMascot state="idle" size={300} style={styles.icon} />

          <Text style={styles.title}>UNILINGO</Text>
          <Text style={styles.subtitle}>Learn each day, speak your way</Text>


        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  smallLogo: {
    position: 'absolute',
    top: 24,
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 6,
    color: '#F6D85F',
  },
  icon: {
    width: '100%',
    maxWidth: 240,
    height: 200,
    flexShrink: 1,
    marginBottom: 0,
  },
  title: {
    marginTop: 10,
    fontSize: 38,
    lineHeight: 48,
    fontWeight: '900',
    textAlign: 'center',
    color: '#F6D85F',
    letterSpacing: 3,
  },
  subtitle: {
    marginTop: 20,
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF3C7',
  },
  activeDot: {
    backgroundColor: '#F6D85F',
  },
  buttonContainer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 16,
  },
  signUpButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F6D85F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#1F2937',
    fontSize: 22,
    fontWeight: '700',
  },
  signInButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F6D85F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: '#F6D85F',
    fontSize: 22,
    fontWeight: '700',
  },
});
