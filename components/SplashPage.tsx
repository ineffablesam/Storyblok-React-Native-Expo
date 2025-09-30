import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps): React.JSX.Element {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const backgroundOpacity = useSharedValue(1);
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animation sequence
    startSplashAnimation();
  }, []);

  const startSplashAnimation = () => {
    // Logo entrance animation
    logoScale.value = withDelay(
      300,
      withSpring(1, {
        damping: 15,
        stiffness: 200,
        mass: 0.8,
      })
    );

    logoOpacity.value = withDelay(
      300,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      })
    );

    // Subtle logo rotation for dynamic feel
    logoRotation.value = withDelay(
      300,
      withSequence(
        withTiming(5, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) })
      )
    );

    // Glow effect animation
    glowScale.value = withDelay(
      500,
      withSpring(1.2, {
        damping: 20,
        stiffness: 150,
      })
    );

    glowOpacity.value = withDelay(
      500,
      withSequence(
        withTiming(0.8, { duration: 600 }),
        withTiming(0.3, { duration: 800 }),
        withTiming(0, { duration: 400 })
      )
    );

    // Text entrance animation
    textOpacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      })
    );

    textTranslateY.value = withDelay(
      1000,
      withSpring(0, {
        damping: 20,
        stiffness: 300,
      })
    );

    // Exit animation
    setTimeout(() => {
      logoScale.value = withTiming(1.1, {
        duration: 300,
        easing: Easing.in(Easing.quad),
      });

      logoOpacity.value = withTiming(0, {
        duration: 400,
        easing: Easing.in(Easing.quad),
      });

      textOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.quad),
      });

      backgroundOpacity.value = withTiming(
        0,
        {
          duration: 500,
          easing: Easing.in(Easing.quad),
        },
        () => {
          if (onFinish) {
            runOnJS(onFinish)();
          }
        }
      );
    }, 2500);
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      {/* Background gradient effect */}
      <View style={styles.gradientBackground} />
      
      {/* Animated glow effect behind logo */}
      <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
        <View style={styles.glow} />
      </Animated.View>

      {/* Logo container */}
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* App name */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <ThemedText style={styles.appName}>Storyblok</ThemedText>
        <ThemedText style={styles.tagline}>Giving Voice to Your Articles</ThemedText>
      </Animated.View>

      {/* Decorative elements */}
      <View style={styles.decorativeContainer}>
        <View style={[styles.decorativeDot, { top: '15%', left: '10%' }]} />
        <View style={[styles.decorativeDot, { top: '25%', right: '15%' }]} />
        <View style={[styles.decorativeDot, { bottom: '20%', left: '20%' }]} />
        <View style={[styles.decorativeDot, { bottom: '30%', right: '10%' }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    // Subtle radial gradient effect
    opacity: 0.9,
  },
  glowContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFA500',
    opacity: 0.3,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 20,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 8,
    textShadowColor: 'rgba(255, 165, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  decorativeDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 165, 0, 0.4)',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
});