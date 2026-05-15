/**
 * AuthChoiceScreen — Welcome screen with Sign In / Sign Up options
 * Clean auth-only layout with no homepage background image.
 */
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  navigation: any;
};

export default function AuthChoiceScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.smallLogo}>UNILINGO</Text>

        <Image
          source={require('../../../uni_icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />

        <Text style={styles.title}>{'\n'}UNILINGO</Text>
        <Text style={styles.subtitle}>Learn each day, speak your way</Text>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
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
    color: '#3151C6',
  },
  icon: {
    width: 400,
    height: 300,
    marginBottom: 2,
  },
  title: {
    fontSize: 38,
    lineHeight: 48,
    fontWeight: '900',
    textAlign: 'center',
    color: '#3151C6',
    letterSpacing: 3,
  },
  subtitle: {
    marginTop: 20,
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    letterSpacing: 1.5,
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
    backgroundColor: '#BFD7F2',
  },
  activeDot: {
    backgroundColor: '#3151C6',
  },
  buttonContainer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 16,
  },
  signUpButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#3151C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  signInButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3151C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: '#3151C6',
    fontSize: 22,
    fontWeight: '700',
  },
});
