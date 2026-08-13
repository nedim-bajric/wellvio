import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Gender } from '../types/onboarding';

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

interface ProfileUpsertData {
  gender: Gender;
  date_of_birth: string;
  height_cm: number;
  weight_kg: number;
}

interface OnboardingContextValue {
  form: OnboardingForm;
  updateForm: <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) => void;
  resetForm: () => void;
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

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setError(null);
    setLoading(false);
  }, []);

  const buildProfilePayload = ():
    | { data: ProfileUpsertData }
    | { error: string } => {
    const parsedHeight = parseFloat(form.heightCm);
    const parsedCurrentWeight = parseFloat(form.currentWeightKg);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth) ||
      Number.isNaN(parsedHeight) ||
      Number.isNaN(parsedCurrentWeight)
    ) {
      return { error: 'Please fill in all fields with valid values' };
    }

    return {
      data: {
        gender: form.gender,
        date_of_birth: form.dateOfBirth,
        height_cm: parsedHeight,
        weight_kg: parsedCurrentWeight,
      },
    };
  };

  const createProfile = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError('User not authenticated');
        return false;
      }

      const payload = buildProfilePayload();
      if ('error' in payload) {
        setError(payload.error);
        return false;
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: session.user.id,
            ...payload.data,
          },
          { onConflict: 'user_id' },
        );

      if (upsertError) {
        setError(upsertError.message);
        return false;
      }

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
        resetForm,
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
