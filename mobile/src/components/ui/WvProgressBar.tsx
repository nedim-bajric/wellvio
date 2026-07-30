import { View, StyleSheet } from 'react-native';

interface WvProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  bgColor?: string;
  height?: number;
  style?: object;
}

export function WvProgressBar({
  progress,
  color = '#00D09C',
  bgColor,
  height = 6,
  style,
}: WvProgressBarProps) {
  const pct = Math.min(Math.max(progress, 0), 1);
  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: bgColor ?? '#E5E5EA',
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${pct * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
