import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { onboardingApi } from '../api/onboardingApi';
import type {
  ActivityLevel,
  CreateProfileData,
  Gender,
} from '../types/onboarding';

export interface OnboardingForm {
  gender: Gender;
  dateOfBirth: string;
  heightCm: string;
  currentWeightKg: string;
  healthDisclaimerAcknowledged: boolean;
}

const INITIAL_FORM: OnboardingForm = {
  gender: 'male',
  dateOfBirth: '',
  heightCm: '',
  currentWeightKg: '',
  healthDisclaimerAcknowledged: false,
};

function computeAge(dateOfBirth: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return null;
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 && age <= 120 ? age : null;
}

interface OnboardingContextValue {
  form: OnboardingForm;
  updateForm: <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) => void;
  loading: boolean;
  error: string | null;
  createProfile: () => Promise<boolean>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = useCallback(<K extends keyof OnboardingForm>(
    key: K,
    value: OnboardingForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const parseProfile = (): { data: CreateProfileData } | { error: string } => {
    const age = computeAge(form.dateOfBirth);
    const parsedHeight = parseFloat(form.heightCm);
    const parsedCurrentWeight = parseFloat(form.currentWeightKg);

    if (
      age === null ||
      Number.isNaN(parsedHeight) ||
      Number.isNaN(parsedCurrentWeight)
    ) {
      return { error: 'Please fill in all fields with valid values' };
    }

    // Activity level and weight goals are configured outside of onboarding,
    // so default to a maintenance profile until the user updates them.
    const defaultActivityLevel: ActivityLevel = 'moderate';
    const defaultGoalWeightKg = parsedCurrentWeight;
    const defaultTargetDate = new Date();
    defaultTargetDate.setDate(defaultTargetDate.getDate() + 90);

    return {
      data: {
        gender: form.gender,
        age,
        heightCm: parsedHeight,
        currentWeightKg: parsedCurrentWeight,
        goalWeightKg: defaultGoalWeightKg,
        activityLevel: defaultActivityLevel,
        targetDate: defaultTargetDate.toISOString(),
        healthDisclaimerAcknowledged: form.healthDisclaimerAcknowledged,
      },
    };
  };

  const createProfile = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const parsed = parseProfile();
      if ('error' in parsed) {
        setError(parsed.error);
        return false;
      }
      await onboardingApi.createProfile(parsed.data);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <OnboardingContext.Provider
      value={{
        form,
        updateForm,
        loading,
        error,
        createProfile,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return ctx;
}
