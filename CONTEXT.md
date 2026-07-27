# wellvio — Project context

## Domain model

### Entities

- **User**
  - A person using the app.
  - Authenticates with email and password.
  - Owns one **Profile** and one active **Plan** at a time.

- **Profile**
  - The user's body and goal inputs: gender, age, height, current weight, goal weight, activity level, target date.
  - Requires a health disclaimer acknowledgment before **Plan** activation.

- **Plan**
  - Generated from the user's **Profile**.
  - Defines daily targets for: calories, protein, carbs, fat.
  - One of 2–3 preset rates: mild, moderate, aggressive.
  - Capped by safety floors (e.g., 1,200 kcal/day women, 1,500 kcal/day men) and refuses unsafe rates.
  - Target-date feasibility is validated at creation.
  - A user has only one active **Plan** at a time.

- **Food**
  - User-created catalog item.
  - Stores name and nutrients per 100g: calories, protein, carbs, fat.

- **Log entry**
  - One instance of eating.
  - Links a **Food**, a portion in grams, a **Meal slot**, and a timestamp.

- **Meal slot**
  - Breakfast, Lunch, Dinner, Snacks.
  - Each slot gets a share of the daily budget for pacing.

- **Weight log**
  - Timestamped weight entry.
  - Used to compute trend and suggest plan adjustments.

## Modules

- **Diet**
  - Food catalog, logging, meal slots, plans, weight log, and plan adaptation.
  - This is the v0 module.

- **Activity** *(full vision, deferred)*
  - Workouts, steps, active calories, and device integrations.

- **Health** *(full vision, deferred)*
  - Sleep, hydration, body measurements, trends, and non-weight health metrics.

## Core user flow

1. Onboarding: user enters profile → app calculates TDEE → offers 2–3 safe plans.
2. Plan selection: user picks a plan and target date → app validates feasibility.
3. Daily use: dashboard shows progress against targets and meal-slot budgets.
4. Logging: user picks a Food (catalog or recent), enters grams, assigns a meal slot.
5. Tracking: user logs weight periodically → app compares trend to plan → suggests adjustments.

## v0 scope boundaries

- Modules: **Diet only**. Activity and Health are deferred.
- Auth: basic email + password with JWT. No OAuth, no social login, no email verification, no roles.
- User model: multi-user capable, not "only for me."
- Mobile client: **React Native with Expo** for iOS and Android.
- Nutrients tracked: calories, protein, carbs, fat only.
- Portions: grams only. Pieces and other units are out of v0.
- No recipes and no food suggestions.
- Alerts are visual/passive only; no push notifications.
- Plan adaptation is suggested, not automatic.
- No third-party integrations in v0.
- Health disclaimer acknowledgment required before plan activation.

## Deferred to full vision

- Barcode scanner for food entry.
- Recipe builder / meal composer.
- AI food suggestions or "what should I eat?" recommendations.
- Photo-based food logging.
- Social features.
- Custom plan templates beyond the 2–3 presets.
- Nutrient timing / meal scheduling beyond slot budgets.
- Fasting tracker.
- Water/hydration tracking.
- Device and app integrations (Garmin, Apple Health, Fitbit, etc.).

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
- Meal planning in v0 means meal-slot budgeting, not content generation.
- v0 is scoped to the Diet module only; Activity and Health are deferred.
- v0 includes basic auth so the code can support multiple users without a later migration.
