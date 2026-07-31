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
  PlanOption,
  PlanRate,
} from '../types/onboarding';

export interface OnboardingForm {
  gender: Gender;
  dateOfBirth: string;
  heightCm: string;
  currentWeightKg: string;
  goalWeightKg: string;
  activityLevel: ActivityLevel;
  targetDate: string;
  healthDisclaimerAcknowledged: boolean;
}

const INITIAL_FORM: OnboardingForm = {
  gender: 'male',
  dateOfBirth: '',
  heightCm: '',
  currentWeightKg: '',
  goalWeightKg: '',
  activityLevel: 'moderate',
  targetDate: '',
  healthDisclaimerAcknowledged: false,
};

export type WeeklyRate = '0.5lb' | '1lb' | '1.5lb' | 'maintain';

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
  weeklyRate: WeeklyRate;
  setWeeklyRate: (rate: WeeklyRate) => void;
  planOptions: PlanOption[];
  selectedRate: PlanRate | null;
  setSelectedRate: (rate: PlanRate | null) => void;
  loading: boolean;
  error: string | null;
  createProfile: () => Promise<boolean>;
  loadPlanOptions: () => Promise<boolean>;
  activatePlan: () => Promise<boolean>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM);
  const [weeklyRate, setWeeklyRate] = useState<WeeklyRate>('1lb');
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<PlanRate | null>(null);
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
    const parsedGoalWeight = parseFloat(form.goalWeightKg);

    if (
      age === null ||
      Number.isNaN(parsedHeight) ||
      Number.isNaN(parsedCurrentWeight) ||
      Number.isNaN(parsedGoalWeight) ||
      !form.targetDate
    ) {
      return { error: 'Please fill in all fields with valid values' };
    }

    const targetDate = new Date(`${form.targetDate}T12:00:00Z`);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (targetDate.getTime() < todayStart.getTime()) {
      return { error: 'Target date must be today or in the future' };
    }

    return {
      data: {
        gender: form.gender,
        age,
        heightCm: parsedHeight,
        currentWeightKg: parsedCurrentWeight,
        goalWeightKg: parsedGoalWeight,
        activityLevel: form.activityLevel,
        targetDate: targetDate.toISOString(),
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

  const loadPlanOptions = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const options = await onboardingApi.getPlanOptions();
      setPlanOptions(options.options);
      if (options.options.length > 0) {
        setSelectedRate(options.options[0].rate);
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plan options';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const activatePlan = useCallback(async (): Promise<boolean> => {
    if (!selectedRate) {
      setError('Please select a plan');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      await onboardingApi.activatePlan(selectedRate);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate plan';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedRate]);

  return (
    <OnboardingContext.Provider
      value={{
        form,
        updateForm,
        weeklyRate,
        setWeeklyRate,
        planOptions,
        selectedRate,
        setSelectedRate,
        loading,
        error,
        createProfile,
        loadPlanOptions,
        activatePlan,
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
