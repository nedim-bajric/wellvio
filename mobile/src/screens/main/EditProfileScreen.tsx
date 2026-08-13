import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { WvInput } from '../../components/ui/WvInput';
import { WvButton } from '../../components/ui/WvButton';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface EditProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
}

function getInitials(name = 'User'): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatGender(gender: string | null | undefined): string {
  if (!gender) return '';
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { profile } = useProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    setName((user?.user_metadata?.display_name as string | undefined) ?? '');
    setEmail(user?.email ?? '');
    setDob(profile?.date_of_birth ?? '');
    setHeight(profile?.height_cm?.toString() ?? '');
    setWeight(profile?.weight_kg?.toString() ?? '');
    setGender(formatGender(profile?.gender));
  }, [user, profile]);

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Edit profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.editAvatarButton,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Camera size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <WvInput
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <WvInput
            label="Email"
            value={email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
          <WvInput
            label="Date of birth"
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <WvInput
                label="Height (cm)"
                value={height}
                onChangeText={setHeight}
                placeholder="cm"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.flex}>
              <WvInput
                label="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                placeholder="kg"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <WvInput
            label="Gender"
            value={gender}
            onChangeText={setGender}
            placeholder="Gender"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Save changes"
          onPress={() => navigation.goBack()}
        />
      </View>
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
    paddingBottom: 16,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    right: '34%',
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});
