import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Moon, Droplets, Activity, Heart, ChevronRight } from 'lucide-react-native';
import { WvCard } from '../../components/ui/WvCard.js';
import { useTheme } from '../../theme/index.js';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types.js';

interface HealthScreenProps {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Health'>,
    NativeStackNavigationProp<RootStackParamList>
  >;
}

export function HealthScreen({ navigation }: HealthScreenProps) {
  const theme = useTheme();
  const [hydration, setHydration] = useState(1500);
  const hydrationGoal = 2500;
  const hydrationPct = Math.min((hydration / hydrationGoal) * 100, 100);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Health
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SleepDetail')}
        >
          <WvCard style={styles.healthCard}>
            <View style={styles.healthLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${theme.colors.purple}15` },
                ]}
              >
                <Moon size={22} color={theme.colors.purple} />
              </View>
              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Sleep
                </Text>
                <Text
                  style={[
                    styles.cardValue,
                    { color: theme.colors.purple },
                  ]}
                >
                  7h 22m
                </Text>
                <Text
                  style={[
                    styles.cardMeta,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  Goal: 8 hours
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textTertiary} />
          </WvCard>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Hydration')}
        >
          <WvCard style={styles.healthCard}>
            <View style={styles.healthLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${theme.colors.blue}15` },
                ]}
              >
                <Droplets size={22} color={theme.colors.blue} />
              </View>
              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Hydration
                </Text>
                <Text
                  style={[
                    styles.cardValue,
                    { color: theme.colors.blue },
                  ]}
                >
                  1,500 ml
                </Text>
                <Text
                  style={[
                    styles.cardMeta,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  Goal: 2,500 ml
                </Text>
              </View>
            </View>
            <View style={styles.hydrationRight}>
              <View
                style={[
                  styles.waterTube,
                  { borderColor: theme.colors.border },
                ]}
              >
                <View
                  style={[
                    styles.waterFill,
                    {
                      height: `${hydrationPct}%`,
                      backgroundColor: `${theme.colors.blue}99`,
                    },
                  ]}
                />
              </View>
              <ChevronRight size={18} color={theme.colors.textTertiary} />
            </View>
          </WvCard>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('BodyMeasurements')}
        >
          <WvCard style={styles.healthCard}>
            <View style={styles.healthLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${theme.colors.primary}15` },
                ]}
              >
                <Activity size={22} color={theme.colors.primary} />
              </View>
              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Body measurements
                </Text>
                <Text
                  style={[
                    styles.cardMeta,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  Last updated Jul 28
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textTertiary} />
          </WvCard>
        </TouchableOpacity>

        <View style={styles.quickAddSection}>
          <Text
            style={[
              styles.quickAddLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Quick add water
          </Text>
          <View style={styles.quickAddButtons}>
            {['250 ml', '500 ml', '750 ml'].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() =>
                  setHydration((h) =>
                    Math.min(hydrationGoal, h + parseInt(amount)),
                  )
                }
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
                  {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <WvCard style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <Heart size={18} color={theme.colors.red} />
            <Text
              style={[
                styles.deviceTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Heart rate
            </Text>
            <View
              style={[
                styles.deviceBadge,
                { backgroundColor: theme.colors.input },
              ]}
            >
              <Text
                style={[
                  styles.deviceBadgeText,
                  { color: theme.colors.textTertiary },
                ]}
              >
                Requires Apple Health
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.deviceBody,
              { color: theme.colors.textTertiary },
            ]}
          >
            Connect a wearable to see real-time heart rate data here.
          </Text>
          <TouchableOpacity>
            <Text
              style={[
                styles.deviceLink,
                { color: theme.colors.primary },
              ]}
            >
              Connect a device →
            </Text>
          </TouchableOpacity>
        </WvCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  healthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  hydrationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterTube: {
    width: 20,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  waterFill: {
    width: '100%',
    borderRadius: 10,
  },
  quickAddSection: {
    marginTop: 4,
  },
  quickAddLabel: {
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickAddButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deviceCard: {
    padding: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  deviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  deviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  deviceBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  deviceBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  deviceLink: {
    fontSize: 13,
    marginTop: 8,
  },
});
