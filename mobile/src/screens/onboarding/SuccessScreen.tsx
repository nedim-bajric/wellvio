import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Check } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { WvButton } from '../../components/ui/WvButton.js';
import { useTheme } from '../../theme/index.js';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types.js';

interface SuccessScreenProps {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Success'>;
}

export function SuccessScreen({ navigation }: SuccessScreenProps) {
  const theme = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fillAnim, scaleAnim]);

  const size = 112;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.ringContainer}>
            <Svg width={size} height={size} style={styles.svg}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={theme.mode === 'dark' ? '#1E1E27' : '#EBEBF0'}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
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
            <View style={styles.checkContainer}>
              <Check
                size={40}
                color={theme.colors.primary}
                strokeWidth={3}
              />
            </View>
          </View>
        </Animated.View>

        <View style={styles.textBlock}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
            ]}
          >
            You&apos;re all set.
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Start logging your first meal to see your daily progress.
          </Text>
        </View>

        <WvButton
          title="Go to dashboard"
          onPress={() => navigation.getParent()?.navigate('Main')}
        />
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  ringContainer: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
});
