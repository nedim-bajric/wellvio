# Auth with Supabase Auth in the mobile app

## Context

wellvio needs authentication so the app can support multiple users without a later migration. The mobile client is a React Native app built with Expo.

We decided to use Supabase Auth and let the mobile app authenticate directly with Supabase.

## Decision

We will use **Supabase Auth** for authentication. The **Expo mobile app** will sign users up, sign them in, reset passwords, and manage the session directly with Supabase Auth.

### Configuration

- Email confirmation is **disabled** for this phase.
- Session tokens are persisted with **`expo-secure-store`**.
- Environment variables: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Password-reset deep-link scheme: `wellvio://reset-password`.

### Mobile app structure

- A root-level `AuthProvider` creates the Supabase client, restores the session from SecureStore, listens to `onAuthStateChange`, and exposes `useAuth()`.
- `RootNavigator` reacts to auth state: Splash → Main if authenticated, otherwise Splash → Welcome.
- Existing screens are wired to Supabase:
  - `LoginScreen`: sign in.
  - `RegisterScreen`: sign up, storing the display name in `user_metadata`.
  - `ForgotPasswordScreen`: send password-reset email.
- A deep-link handler opens the reset-password screen after the user taps the email link.
- `AppSettingsScreen` has an Account section with:
  - Change password (logged in) via `updateUser`.
  - Delete account: re-authenticates, calls the `delete_user()` Postgres function to remove the auth record and cascade-delete all user data, then signs out.

### Current auth flows

1. Sign up → Onboarding.
2. Sign in → Main.
3. Sign out.
4. Password reset via email deep link.
5. Change password while logged in.
6. Delete account (re-authenticate + `delete_user()` RPC + sign out).

## Considered options

- **Hand-rolled JWT in NestJS**: Would require building password hashing, token issuance, and storage in the backend. Rejected because Supabase Auth provides this securely and reduces scope.
- **Supabase Auth only, no backend**: Moves all business logic into the mobile app and Supabase database functions. Accepted for the Diet-only phase because it keeps v0 lean.
- **Backend verifies Supabase JWTs in v0**: Would let protected endpoints check tokens immediately. Rejected because this phase is scoped to mobile-only auth; wiring the backend is a separate, later ticket.
- **AsyncStorage for session tokens**: Simpler API, but stores tokens unencrypted. Rejected because SecureStore is a small lift and better protects sensitive auth data.

## Consequences

- The mobile app depends on `@supabase/supabase-js` and `expo-secure-store`.
- Auth secrets live only in the mobile app.
- True account deletion is implemented via a Supabase Postgres function with `security definer`; foreign keys from `auth.users` cascade delete all user data.
