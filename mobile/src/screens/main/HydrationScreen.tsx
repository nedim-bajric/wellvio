import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, Droplets } from 'lucide-react-native';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import Svg, { Path, ClipPath, Defs, Rect, Text as SvgText } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface HydrationScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Hydration'>;
}

const entries = [
  { time: '8:30 AM', amount: 500 },
  { time: '11:00 AM', amount: 250 },
  { time: '1:15 PM', amount: 500 },
  { time: '3:45 PM', amount: 250 },
];

export function HydrationScreen({ navigation }: HydrationScreenProps) {
  const theme = useTheme();
  const [ml, setMl] = useState(1500);
  const goal = 2500;
  const pct = Math.min((ml / goal) * 100, 100);

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Hydration
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.vizSection}>
          <View style={styles.glassContainer}>
            <Svg width={144} height={176} viewBox="0 0 144 176">
              <Path
                d="M20 20 L124 20 L112 160 Q112 168 100 168 L44 168 Q32 168 32 160 Z"
                fill={theme.colors.input}
              />
              <Defs>
                <ClipPath id="glass-clip">
                  <Path d="M20 20 L124 20 L112 160 Q112 168 100 168 L44 168 Q32 168 32 160 Z" />
                </ClipPath>
              </Defs>
              <Rect
                x="0"
                y={176 - (176 * pct) / 100}
                width="144"
                height={(176 * pct) / 100}
                fill={theme.colors.blue}
                opacity="0.7"
                clipPath="url(#glass-clip)"
              />
              <Path
                d="M20 20 L124 20 L112 160 Q112 168 100 168 L44 168 Q32 168 32 160 Z"
                fill="none"
                stroke={theme.colors.border}
                strokeWidth="2"
              />
              <SvgText
                x="72"
                y="100"
                textAnchor="middle"
                fill="white"
                fontSize="22"
                fontWeight="700"
              >
                {Math.round(pct)}%
              </SvgText>
            </Svg>
          </View>
          <View style={styles.amountText}>
            <Text style={[styles.amountValue, { color: theme.colors.blue }]}>
              {ml}{' '}
              <Text
                style={[
                  styles.amountUnit,
                  { color: theme.colors.textSecondary },
                ]}
              >
                ml
              </Text>
            </Text>
            <Text
              style={[
                styles.amountGoal,
                { color: theme.colors.textTertiary },
              ]}
            >
              of {goal} ml goal
            </Text>
          </View>
        </View>

        <View style={styles.quickAddSection}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Quick add
          </Text>
          <View style={styles.quickAddButtons}>
            {[250, 500, 750].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => setMl(Math.min(goal, ml + amount))}
                style={[
                  styles.quickAddButton,
                  {
                    backgroundColor: `${theme.colors.blue}15`,
                    borderColor: `${theme.colors.blue}40`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.quickAddButtonText,
                    { color: theme.colors.blue },
                  ]}
                >
                  +{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.entriesSection}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Today&apos;s entries
          </Text>
          {entries.map((entry, i) => (
            <View
              key={i}
              style={[
                styles.entryRow,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <View style={styles.entryLeft}>
                <Droplets size={16} color={theme.colors.blue} />
                <Text
                  style={[
                    styles.entryAmount,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {entry.amount} ml
                </Text>
              </View>
              <Text
                style={[
                  styles.entryTime,
                  { color: theme.colors.textTertiary },
                ]}
              >
                {entry.time}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
    alignItems: 'center',
  },
  vizSection: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  glassContainer: {
    width: 144,
    height: 176,
  },
  amountText: {
    alignItems: 'center',
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '700',
  },
  amountUnit: {
    fontSize: 18,
    fontWeight: '400',
  },
  amountGoal: {
    fontSize: 13,
    marginTop: 4,
  },
  quickAddSection: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAddButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickAddButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  entriesSection: {
    width: '100%',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  entryAmount: {
    fontSize: 15,
  },
  entryTime: {
    fontSize: 13,
  },
});
