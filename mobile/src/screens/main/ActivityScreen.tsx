import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Flame } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { WvCard } from '../../components/ui/WvCard';
import { WvButton } from '../../components/ui/WvButton';
import { SafeScreen, useTabBarPadding } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

interface ActivityScreenProps {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Activity'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
}

const workouts = [
  { type: 'Running', date: 'Today', duration: '42 min', kcal: 380, icon: '🏃' },
  { type: 'Strength training', date: 'Yesterday', duration: '55 min', kcal: 290, icon: '🏋️' },
  { type: 'Cycling', date: 'Jul 28', duration: '1h 10 min', kcal: 520, icon: '🚴' },
];

const metrics = [
  { label: 'Steps', value: '6,283', icon: '👟', color: '#0A84FF' },
  { label: 'Distance', value: '4.9 km', icon: '📍', color: '#00D09C' },
  { label: 'Active kcal', value: '380', icon: '🔥', color: '#FF9F43' },
  { label: 'Active min', value: '33', icon: '⏱', color: '#34C759' },
];

const rings = [
  { label: 'Move', value: '380', target: '520', unit: 'kcal', color: '#FF9F43', pct: 0.72, r: 46 },
  { label: 'Exercise', value: '33', target: '60', unit: 'min', color: '#00D09C', pct: 0.55, r: 35 },
  { label: 'Steps', value: '6,283', target: '10,000', unit: '', color: '#0A84FF', pct: 0.63, r: 24 },
];

export function ActivityScreen({ navigation }: ActivityScreenProps) {
  const theme = useTheme();
  const tabBarPadding = useTabBarPadding();

  return (
    <SafeScreen hasTabBar>
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Activity
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarPadding },
        ]}
      >
        <WvCard style={styles.ringsCard}>
          <Text
            style={[
              styles.ringsTitle,
              { color: theme.colors.textPrimary },
            ]}
          >
            Today&apos;s rings
          </Text>
          <View style={styles.ringsRow}>
            <View style={styles.ringContainer}>
              <Svg width={112} height={112} viewBox="0 0 112 112" style={styles.svg}>
                {rings.map((ring) => {
                  const c = 2 * Math.PI * ring.r;
                  return (
                    <Circle
                      key={ring.label}
                      cx="56"
                      cy="56"
                      r={ring.r}
                      fill="none"
                      stroke={theme.mode === 'dark' ? '#2C2C35' : '#E5E5EA'}
                      strokeWidth="8"
                    />
                  );
                })}
                {rings.map((ring) => {
                  const c = 2 * Math.PI * ring.r;
                  return (
                    <Circle
                      key={ring.label}
                      cx="56"
                      cy="56"
                      r={ring.r}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="8"
                      strokeDasharray={c}
                      strokeDashoffset={c * (1 - ring.pct)}
                      strokeLinecap="round"
                      transform="rotate(-90 56 56)"
                    />
                  );
                })}
              </Svg>
            </View>
            <View style={styles.ringLabels}>
              {rings.map((ring) => (
                <View key={ring.label} style={styles.ringLabelRow}>
                  <View
                    style={[
                      styles.ringDot,
                      { backgroundColor: ring.color },
                    ]}
                  />
                  <View>
                    <Text
                      style={[
                        styles.ringValue,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {ring.value}
                      {ring.unit && (
                        <Text
                          style={[
                            styles.ringValueUnit,
                            { color: theme.colors.textTertiary },
                          ]}
                        >
                          {' '}
                          {ring.unit}
                        </Text>
                      )}
                    </Text>
                    <Text
                      style={[
                        styles.ringTarget,
                        { color: theme.colors.textTertiary },
                      ]}
                    >
                      of {ring.target} {ring.unit} · {Math.round(ring.pct * 100)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </WvCard>

        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <WvCard key={m.label} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{m.icon}</Text>
              <Text style={[styles.metricValue, { color: m.color }]}>
                {m.value}
              </Text>
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.colors.textTertiary },
                ]}
              >
                {m.label}
              </Text>
            </WvCard>
          ))}
        </View>

        <View style={styles.workoutsSection}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Recent workouts
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.workoutsList}>
            {workouts.map((w, i) => (
              <WvCard key={i} style={styles.workoutCard}>
                <View style={styles.workoutIconBox}>
                  <Text style={styles.workoutIcon}>{w.icon}</Text>
                </View>
                <View style={styles.workoutInfo}>
                  <Text
                    style={[
                      styles.workoutType,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {w.type}
                  </Text>
                  <Text
                    style={[
                      styles.workoutMeta,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    {w.date} · {w.duration}
                  </Text>
                </View>
                <View style={styles.workoutKcal}>
                  <Text
                    style={[
                      styles.workoutKcalValue,
                      { color: theme.colors.activityOrange },
                    ]}
                  >
                    {w.kcal}
                  </Text>
                  <Text
                    style={[
                      styles.workoutKcalUnit,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    kcal
                  </Text>
                </View>
              </WvCard>
            ))}
          </View>
        </View>

        <WvButton
          title="Log a workout"
          onPress={() => navigation.navigate('LogWorkout')}
          icon={<Flame size={20} color="#000000" />}
          style={{ backgroundColor: theme.colors.activityOrange }}
        />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  ringsCard: {
    padding: 20,
  },
  ringsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ringContainer: {
    width: 112,
    height: 112,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  ringLabels: {
    flex: 1,
    gap: 12,
  },
  ringLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ringDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ringValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  ringValueUnit: {
    fontWeight: '400',
    fontSize: 11,
  },
  ringTarget: {
    fontSize: 10,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  workoutsSection: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  workoutsList: {
    gap: 8,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  workoutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutIcon: {
    fontSize: 22,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 15,
    fontWeight: '500',
  },
  workoutMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  workoutKcal: {
    alignItems: 'flex-end',
  },
  workoutKcalValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  workoutKcalUnit: {
    fontSize: 10,
  },
});
