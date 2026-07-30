import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { WvButton } from '../../components/ui/WvButton.js';
import { useTheme } from '../../theme/index.js';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types.js';

interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const svgSize = Math.min(width - 64, 280);
  const center = svgSize / 2;

  const outerR = svgSize * 0.42;
  const midR = svgSize * 0.33;
  const innerR = svgSize * 0.24;
  const outerC = 2 * Math.PI * outerR;
  const midC = 2 * Math.PI * midR;
  const innerC = 2 * Math.PI * innerR;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.hero}>
        <Svg width={svgSize} height={svgSize} style={styles.svg}>
          <Circle
            cx={center}
            cy={center}
            r={outerR}
            fill="none"
            stroke={theme.mode === 'dark' ? '#1E1E27' : '#EBEBF0'}
            strokeWidth={svgSize * 0.04}
          />
          <Circle
            cx={center}
            cy={center}
            r={outerR}
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth={svgSize * 0.04}
            strokeDasharray={outerC}
            strokeDashoffset={outerC * 0.25}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            opacity={0.9}
          />
          <Circle
            cx={center}
            cy={center}
            r={midR}
            fill="none"
            stroke={theme.mode === 'dark' ? '#1E1E27' : '#EBEBF0'}
            strokeWidth={svgSize * 0.035}
          />
          <Circle
            cx={center}
            cy={center}
            r={midR}
            fill="none"
            stroke={theme.colors.blue}
            strokeWidth={svgSize * 0.035}
            strokeDasharray={midC}
            strokeDashoffset={midC * 0.25}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            opacity={0.85}
          />
          <Circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={theme.mode === 'dark' ? '#1E1E27' : '#EBEBF0'}
            strokeWidth={svgSize * 0.035}
          />
          <Circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={theme.colors.orange}
            strokeWidth={svgSize * 0.035}
            strokeDasharray={innerC}
            strokeDashoffset={innerC * 0.25}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            opacity={0.8}
          />
          <Circle
            cx={center}
            cy={center}
            r={svgSize * 0.16}
            fill={theme.mode === 'dark' ? '#15151C' : '#F5F5F7'}
          />
          <SvgText
            x={center}
            y={center - 6}
            textAnchor="middle"
            fill={theme.colors.textPrimary}
            fontSize={svgSize * 0.08}
            fontWeight="700"
          >
            1,840
          </SvgText>
          <SvgText
            x={center}
            y={center + 12}
            textAnchor="middle"
            fill={theme.colors.textSecondary}
            fontSize={svgSize * 0.04}
          >
            kcal left
          </SvgText>
        </Svg>
      </View>

      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
            ]}
          >
            Your health, simplified.
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Track nutrition, training, sleep, and recovery in one place.
          </Text>
        </View>

        <View style={styles.actions}>
          <WvButton
            title="Get started"
            onPress={() => navigation.navigate('Register')}
          />
          <WvButton
            title="I already have an account"
            variant="secondary"
            onPress={() => navigation.navigate('Login')}
          />
        </View>

        <Text
          style={[
            styles.terms,
            { color: theme.colors.textTertiary },
          ]}
        >
          By continuing, you agree to our{' '}
          <Text style={{ color: theme.colors.primary }}>Terms</Text> and{' '}
          <Text style={{ color: theme.colors.primary }}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  textBlock: {
    gap: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  terms: {
    fontSize: 13,
    textAlign: 'center',
  },
});
