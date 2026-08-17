# Mobile owns diet calculations and persistence in v0

## Status

Accepted — supersedes the diet-calculation scope described in [0003-supabase-auth-mobile.md](./0003-supabase-auth-mobile.md).

## Context

The original plan kept a NestJS backend responsible for diet calculations and complex logic, with Supabase Auth used only for authentication. As the v0 diet module was implemented, several constraints made that split awkward:

- The mobile app needs to generate plans, render live options, and compute macro targets while the user is interacting with onboarding screens.
- The mobile app needs to read and write food logs, weight logs, and the food catalog with low latency and without requiring the backend to be deployed.
- All v0 diet data is user-scoped and fits naturally into Supabase row-level security policies.

The GitHub issues for the v0 diet module (#58–#63) therefore require the mobile app to own the diet domain logic and persist directly to Supabase.

## Decision

For v0, the **Expo mobile app** owns diet calculations and persistence:

- Diet math (BMR, TDEE, plan generation, macro targets, feasibility) lives in the mobile codebase (`mobile/src/utils/diet.ts`).
- Diet raw-data tables (`plans`, `foods`, `log_entries`, `weight_logs`) live in Supabase with RLS enforcing `user_id = auth.uid()`.
- The mobile app reads and writes these tables directly via `@supabase/supabase-js`.
- The active plan pointer on `profiles.active_plan_id` is maintained by the mobile app.

The v0 mobile client does not use a backend for diet features.

## Consequences

- v0 diet features work against Supabase alone; no backend is required.
- RLS policies must be kept in sync with the mobile client’s queries.
- A future phase may reintroduce backend diet endpoints (e.g., for admin, sharing, or server-side validation) without changing the mobile schema.
- Diet calculation unit tests live in the mobile codebase alongside the calculation functions.
