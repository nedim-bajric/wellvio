# wellvio — Project context

## Domain model

### Entities

- **User**
  - A person using the app.
  - Authenticates with email and password through Supabase Auth.
  - Owns one **Profile** and one active **Plan** at a time.

- **Profile**
  - The user's body inputs: gender, date of birth, height, current weight.
  - Also stores goal-related inputs used by plan generation: goal weight, activity level, target date.
  - Requires a health disclaimer acknowledgment before **Plan** activation.

- **Plan**
  - Generated from the user's **Profile**.
  - Defines daily targets for: calories, protein, carbs, fat.
  - One of three preset rates: mild, moderate, aggressive.
  - Capped by safety floors (1,200 kcal/day for women, 1,500 kcal/day for men) and refuses unsafe rates.
  - Target-date feasibility is validated at creation.
  - A user has only one active **Plan** at a time.

- **Food**
  - User-created catalog item.
  - Stores name and nutrients per 100 g: calories, protein, carbs, fat.
  - Quick-add entries also create a Food row so the log entry stays linked to a catalog item.

- **Log entry**
  - One instance of eating.
  - Links a **Food**, a portion in grams, a meal label, and a timestamp.
  - Meal label is one of: Breakfast, Lunch, Dinner, Snacks. It is a label only; there are no per-label budgets.

- **Weight log**
  - Timestamped weight entry.
  - Used to show recent history and a simple trend.

## Modules

- **Diet**
  - Food catalog, logging, plans, weight log, onboarding, and profile.
  - This is the only module in the current build.

## Core user flow

1. Onboarding: user enters profile → accepts health disclaimer → app calculates TDEE → offers safe plans.
2. Plan selection: user picks a plan → app stores it as the active plan.
3. Daily use: dashboard shows progress against daily targets and recent entries.
4. Logging: user opens the log sheet, picks a food from the catalog/recent list or quick-adds macros, sets grams, and picks a meal label.
5. Tracking: user logs weight periodically → app shows history and a short-term trend.

## Current scope boundaries

- **Modules: Diet only.** Activity, Health, and device integrations are not in the current build.
- **Auth: Supabase Auth with email + password.** No OAuth, social login, email verification, or roles. Mobile talks directly to Supabase Auth.
- **User model: multi-user capable.** The data model carries `user_id` and uses Supabase row-level security.
- **Mobile client: React Native with Expo** for iOS and Android.
- **Nutrients tracked: calories, protein, carbs, fat only.**
- **Portions: grams only.** Other units are not supported.
- **No recipes and no food suggestions.**
- **Alerts are visual/passive only; no push notifications.**
- **No automatic plan adaptation.** Plans are static once activated; users can regenerate/activate a new plan manually.
- **No third-party integrations.**
- **Health disclaimer acknowledgment required before plan activation.**
- **Persistence:** the mobile app reads and writes Diet data directly from Supabase.

## Deferred to future phases

- Barcode scanner for food entry.
- Recipe builder / meal composer.
- AI food suggestions or "what should I eat?" recommendations.
- Photo-based food logging.
- Social features.
- Custom plan templates beyond the three presets.
- Nutrient timing / meal scheduling.
- Fasting tracker.
- Water/hydration tracking.
- Sleep, body measurements, and other health metrics.
- Activity and workout tracking.
- Device and app integrations (Garmin, Apple Health, Fitbit, etc.).
- A backend or Supabase Edge Functions for logic that cannot run on the mobile client.

## Explicitly ruled out of MVP

- AI/ML features.
- Social features.
- Payments, subscriptions, or billing.
- Offline/PWA support.
- Medical diagnoses, prescriptions, or clinical claims.
- Automated data import/export.
- Admin dashboard or moderation tools.

## Decisions

- Food is a reusable catalog item; a log entry is a distinct instance.
- Plans are generated from TDEE minus a deficit, with hard safety caps.
- Meal labels in this phase are labels only, not budgets.
- The current build is scoped to the Diet module only.
- The mobile app owns Diet calculations and persistence via Supabase in this phase.
