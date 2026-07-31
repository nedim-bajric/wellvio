import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/index';

interface DateOfBirthFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function WebDateInput({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (value: string) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return React.createElement('input', {
    type: 'date',
    value: value || '',
    max: formatDate(new Date()),
    onChange: (e: { currentTarget: { value: string } }) =>
      onChange(e.currentTarget.value),
    placeholder: 'Select date',
    style: {
      width: '100%',
      height: 56,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: theme.colors.inputFocusedBorder,
      backgroundColor: theme.colors.input,
      color: theme.colors.textPrimary,
      fontSize: 17,
      paddingHorizontal: 16,
      outline: 'none',
    },
  });
}

export function DateOfBirthField({ value, onChange }: DateOfBirthFieldProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const selectedDate = parseDate(value) ?? new Date(1990, 0, 1);
  const [pickerDate, setPickerDate] = useState<Date>(selectedDate);

  const openPicker = () => {
    setPickerDate(selectedDate);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  const confirmPicker = () => {
    onChange(formatDate(pickerDate));
    setShowPicker(false);
  };

  const handleAndroidChange = (_event: unknown, date?: Date) => {
    setShowPicker(false);
    if (date) {
      onChange(formatDate(date));
    }
  };

  const handleIOSChange = (_event: unknown, date?: Date) => {
    if (date) {
      setPickerDate(date);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Date of birth
        </Text>
        <WebDateInput value={value} onChange={onChange} theme={theme} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        onPress={openPicker}
        style={[styles.label, { color: theme.colors.textSecondary }]}
      >
        Date of birth
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openPicker}
        style={[
          styles.display,
          {
            backgroundColor: theme.colors.input,
            borderColor: theme.colors.inputFocusedBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.displayText,
            {
              color: value ? theme.colors.textPrimary : theme.colors.textTertiary,
            },
          ]}
        >
          {value || 'Select date'}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={closePicker}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={closePicker} />
            <View style={styles.modalSheet}>
              <View
                style={[
                  styles.modalHeader,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TouchableOpacity onPress={closePicker}>
                  <Text
                    style={[
                      styles.modalAction,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmPicker}>
                  <Text
                    style={[
                      styles.modalAction,
                      { color: theme.colors.primary, fontWeight: '600' },
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.pickerContainer,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="spinner"
                  onChange={handleIOSChange}
                  maximumDate={new Date()}
                  textColor={theme.colors.textPrimary}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : showPicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          maximumDate={new Date()}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  display: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalAction: {
    fontSize: 17,
  },
  pickerContainer: {
    paddingVertical: 8,
  },
});
