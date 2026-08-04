import { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/index';
import { useAuth } from '../../contexts/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface SplashScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
}

const SPLASH_MIN_DURATION_MS = 1500;

export function SplashScreen({ navigation }: SplashScreenProps) {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const pulse = useRef(new Animated.Value(1)).current;
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, SPLASH_MIN_DURATION_MS);

    return () => {
      clearTimeout(minTimer);
      pulseAnimation.stop();
    };
  }, [pulse]);

  useEffect(() => {
    if (!authLoading && minTimeElapsed) {
      navigation.replace(user ? 'Main' : 'Welcome');
    }
  }, [authLoading, minTimeElapsed, navigation, user]);

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * 0.25;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <View style={styles.ringContainer}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={theme.mode === 'dark' ? '#1E1E27' : '#EBEBF0'}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={theme.colors.primary}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.dot}>
            <View
              style={[
                styles.dotInner,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
        </View>
      </Animated.View>
      <View style={styles.wordmarkContainer}>
        <Animated.Text
          style={[
            styles.wordmark,
            {
              color: theme.colors.textPrimary,
              opacity: pulse.interpolate({
                inputRange: [1, 1.15],
                outputRange: [0.9, 1],
              }),
            },
          ]}
        >
          wellvio
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  wordmarkContainer: {
    marginTop: 24,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
