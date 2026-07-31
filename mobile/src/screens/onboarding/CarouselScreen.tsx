import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Circle,
  Rect,
  Line,
  Path,
  Text as SvgText,
  ClipPath,
  Defs,
} from 'react-native-svg';
import { WvButton } from '../../components/ui/WvButton';
import { useTheme } from '../../theme/index';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';

interface CarouselScreenProps {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Carousel'>;
}

type SlideVisual = (dark: boolean, size: number) => React.ReactNode;

interface Slide {
  title: string;
  body: string;
  visual: SlideVisual;
}

function FoodVisual(dark: boolean, size: number) {
  const c = size / 2;
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 240 200">
      <Circle cx="120" cy="100" r="80" fill={dark ? '#15151C' : '#F5F5F7'} />
      <Rect x="100" y="40" width="6" height="60" rx="3" fill="#00D09C" />
      <Rect x="120" y="40" width="6" height="30" rx="3" fill="#00D09C" />
      <Circle cx="123" cy="80" r="10" fill="none" stroke="#00D09C" strokeWidth="3" />
      <Rect x="123" y="87" width="6" height="35" rx="3" fill="#00D09C" />
      <Rect x="134" y="40" width="6" height="80" rx="3" fill="#00D09C" />
      <Circle cx="60" cy="60" r="5" fill="#0A84FF" opacity="0.6" />
      <Circle cx="185" cy="70" r="4" fill="#FF9F0A" opacity="0.5" />
      <Circle cx="55" cy="148" r="3" fill="#BF5AF2" opacity="0.5" />
      <Circle cx="190" cy="140" r="6" fill="#00D09C" opacity="0.3" />
    </Svg>
  );
}

function GoalsVisual(dark: boolean, size: number) {
  const c = size / 2;
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 240 200">
      <Circle cx="120" cy="100" r="86" fill={dark ? '#15151C' : '#F5F5F7'} />
      <Circle cx="120" cy="100" r="70" fill="none" stroke={dark ? '#1E1E27' : '#EBEBF0'} strokeWidth="10" />
      <Circle cx="120" cy="100" r="70" fill="none" stroke="#00D09C" strokeWidth="10"
        strokeDasharray="440" strokeDashoffset="110" strokeLinecap="round" transform="rotate(-90 120 100)" />
      <Circle cx="120" cy="100" r="52" fill="none" stroke={dark ? '#1E1E27' : '#EBEBF0'} strokeWidth="8" />
      <Circle cx="120" cy="100" r="52" fill="none" stroke="#0A84FF" strokeWidth="8"
        strokeDasharray="327" strokeDashoffset="82" strokeLinecap="round" transform="rotate(-90 120 100)" />
      <Circle cx="120" cy="100" r="37" fill="none" stroke={dark ? '#1E1E27' : '#EBEBF0'} strokeWidth="8" />
      <Circle cx="120" cy="100" r="37" fill="none" stroke="#FF9F0A" strokeWidth="8"
        strokeDasharray="233" strokeDashoffset="58" strokeLinecap="round" transform="rotate(-90 120 100)" />
      <SvgText x="120" y="96" textAnchor="middle" fill={dark ? '#FFF' : '#0B0B0F'}
        fontSize="18" fontWeight="700">1,840</SvgText>
      <SvgText x="120" y="112" textAnchor="middle" fill={dark ? '#8E8E9C' : '#6B6B78'}
        fontSize="10">kcal left</SvgText>
    </Svg>
  );
}

function ConnectVisual(dark: boolean, size: number) {
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 240 200">
      <Circle cx="120" cy="100" r="80" fill={dark ? '#15151C' : '#F5F5F7'} />
      <Rect x="98" y="60" width="44" height="56" rx="12" fill={dark ? '#1C1C24' : '#E5E5EA'} />
      <Rect x="102" y="64" width="36" height="48" rx="8" fill={dark ? '#0B0B0F' : '#FFFFFF'} />
      <Circle cx="120" cy="88" r="14" fill="none" stroke="#00D09C" strokeWidth="3" />
      <Circle cx="120" cy="88" r="14" fill="none" stroke={dark ? '#1E1E27' : '#EBEBF0'} strokeWidth="3"
        strokeDasharray="88" strokeDashoffset="30" strokeLinecap="round" transform="rotate(-90 120 88)" />
      <Line x1="120" y1="140" x2="80" y2="162" stroke="#0A84FF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      <Line x1="120" y1="140" x2="160" y2="162" stroke="#0A84FF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      <Circle cx="80" cy="165" r="8" fill={dark ? '#1E1E27' : '#EBEBF0'} />
      <SvgText x="80" y="169" textAnchor="middle" fill="#0A84FF" fontSize="8">♥</SvgText>
      <Circle cx="160" cy="165" r="8" fill={dark ? '#1E1E27' : '#EBEBF0'} />
      <SvgText x="160" y="169" textAnchor="middle" fill="#00D09C" fontSize="8">⚡</SvgText>
    </Svg>
  );
}

function SafetyVisual(dark: boolean, size: number) {
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 240 200">
      <Circle cx="120" cy="100" r="80" fill={dark ? '#15151C' : '#F5F5F7'} />
      <Path d="M120 55 L148 72 L148 110 C148 128 135 142 120 150 C105 142 92 128 92 110 L92 72 Z"
        fill="none" stroke="#00D09C" strokeWidth="4" strokeLinejoin="round" />
      <Path d="M110 100 L118 108 L132 92" stroke="#00D09C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const slides: Slide[] = [
  {
    title: 'Track what you eat',
    body: 'Log meals in seconds with our smart food search, barcode scanner, and custom foods.',
    visual: FoodVisual,
  },
  {
    title: 'Hit your goals',
    body: 'See your macro rings fill up as you eat. Stay on track with smart daily targets.',
    visual: GoalsVisual,
  },
  {
    title: 'Connect your world',
    body: 'Sync with Apple Health, Garmin, Fitbit and smart scales automatically.',
    visual: ConnectVisual,
  },
  {
    title: 'Your safety matters',
    body: 'wellvio provides general wellness guidance. Always consult a healthcare professional for medical advice.',
    visual: SafetyVisual,
  },
];

export function CarouselScreen({ navigation }: CarouselScreenProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const slide = slides[page];
  const visualSize = Math.min(width - 64, 260);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.slide}>
        <View style={styles.visual}>
          {slide.visual(theme.mode === 'dark', visualSize)}
        </View>
        <View style={styles.textBlock}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
            ]}
          >
            {slide.title}
          </Text>
          <Text
            style={[
              styles.body,
              { color: theme.colors.textSecondary },
            ]}
          >
            {slide.body}
          </Text>
        </View>
      </View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setPage(i)}
            style={[
              styles.dot,
              {
                width: i === page ? 24 : 8,
                backgroundColor:
                  i === page
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <WvButton
          title={page < slides.length - 1 ? 'Continue' : "Let's go"}
          onPress={() =>
            page < slides.length - 1
              ? setPage(page + 1)
              : navigation.navigate('PersonalProfile')
          }
        />
        {page < slides.length - 1 && (
          <WvButton
            title="Skip"
            variant="outline"
            onPress={() => navigation.navigate('PersonalProfile')}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  visual: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
});
