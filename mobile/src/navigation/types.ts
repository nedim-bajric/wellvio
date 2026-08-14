import type { MealSlot } from '../types/logEntry';

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

export type OnboardingStackParamList = {
  Carousel: undefined;
  PersonalProfile: undefined;
  Disclaimer: undefined;
  CreatePlan: undefined;
  Success: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Diary: undefined;
  Activity: undefined;
  Health: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  WeightLog: undefined;
  AddFood: undefined;
  FoodDetail: undefined;
  QuickAdd: undefined;
};

export type DiaryStackParamList = {
  DiaryMain: undefined;
  AddFood: undefined;
  FoodDetail: undefined;
  QuickAdd: undefined;
};

export type ActivityStackParamList = {
  ActivityMain: undefined;
  LogWorkout: undefined;
};

export type HealthStackParamList = {
  HealthMain: undefined;
  SleepDetail: undefined;
  Hydration: undefined;
  BodyMeasurements: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  GoalsTargets: undefined;
  PlanSettings: undefined;
  AppSettings: undefined;
  ConnectedDevices: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Onboarding: undefined;
  Main: undefined;
  CreatePlan: { returnToMain?: boolean } | undefined;
  AddFood: { mealSlot?: MealSlot } | undefined;
  FoodDetail: { foodId: string; mealSlot?: MealSlot };
  QuickAdd: { mealSlot?: MealSlot } | undefined;
  FoodCatalog: undefined;
  WeightLog: undefined;
  LogWorkout: undefined;
  SleepDetail: undefined;
  Hydration: undefined;
  BodyMeasurements: undefined;
  EditProfile: undefined;
  GoalsTargets: undefined;
  AppSettings: undefined;
  ChangePassword: undefined;
  DeleteAccount: undefined;
  PlanSettings: undefined;
};
