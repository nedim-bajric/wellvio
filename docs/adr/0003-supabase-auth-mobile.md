# Auth with Supabase Auth in the mobile app

## Context

wellvio v0 needs authentication so the app can support multiple users without a later migration. The mobile client is a React Native app built with Expo, and the backend is NestJS.

The original plan was a hand-rolled email/password JWT flow inside the NestJS backend. After reviewing the current state of the codebase, we decided to use Supabase Auth and let the mobile app authenticate directly with Supabase.

## Decision

We will use **Supabase Auth** for v0 authentication. The **Expo mobile app** will sign users up, sign them in, reset passwords, and manage the session directly with Supabase Auth. The **NestJS backend will not participate in auth during v0**; backend JWT verification is deferred to a later phase.

### Configuration

- Email confirmation is **disabled** for v0.
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
- A deep-link handler opens a reset-password screen after the user taps the email link.
- `AppSettingsScreen` gains an Account section with:
  - Change password (logged in) via `updateUser`.
  - Delete account: signs out and clears local state; true backend/Edge Function deletion is deferred.

### v0 auth flows

1. Sign up → Onboarding.
2. Sign in → Main.
3. Sign out.
4. Password reset via email deep link.
5. Change password while logged in.
6. Delete account (local sign-out + state clear only).

## Considered options

- **Hand-rolled JWT in NestJS**: Would require building password hashing, token issuance, and storage in the backend. Rejected because Supabase Auth provides this securely and reduces v0 scope.
- **Supabase Auth only, no backend**: Would mean moving all business logic into the mobile app or Supabase functions. Rejected because we want to keep the NestJS backend for diet calculations and other complex logic.
- **Backend verifies Supabase JWTs in v0**: Would let protected endpoints check tokens immediately. Rejected because this phase is scoped to mobile-only auth; wiring the backend is a separate, later ticket.
- **AsyncStorage for session tokens**: Simpler API, but stores tokens unencrypted. Rejected because SecureStore is a small lift and better protects sensitive auth data.

## Consequences

- The mobile app depends on `@supabase/supabase-js` and `expo-secure-store`.
- Auth secrets live only in the mobile app during v0; the backend uses a hardcoded `x-user-id` header for now.
- A future phase will teach the NestJS backend to verify Supabase JWTs and remove the hardcoded header.
- True account deletion requires service-role access and will be implemented later via an Edge Function or backend endpoint.
