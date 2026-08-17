# wellvio

Diet tracking mobile app. Current build covers the Diet module: onboarding, plan generation, food catalog, daily logging, weight tracking, and profile management.

## Mobile

The React Native mobile client lives in `mobile/` and is built with Expo. It owns the Diet domain logic and talks directly to Supabase for persistence.

```bash
cd mobile
npm install
npm run start       # start Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run typecheck   # TypeScript check
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for Supabase.

## Current scope

- **Auth**: Supabase Auth with email + password. No email verification, OAuth, or roles.
- **Onboarding**: profile (gender, date of birth, height, weight), health disclaimer, plan creation.
- **Plan**: BMR/TDEE-based plan generation with mild/moderate/aggressive rates and safety floors.
- **Food catalog**: user-created foods with calories, protein, carbs, and fat per 100 g.
- **Logging**: foods or quick-add entries tagged with a meal label (Breakfast, Lunch, Dinner, Snacks), portioned in grams.
- **Dashboard/Diary**: daily calorie/macros progress, recent entries, and date-based log history.
- **Weight log**: timestamped entries with a simple trend chart.
- **Profile/Settings**: edit profile, dark mode, change password, delete account.

## Out of the current build

Activity tracking, Health metrics, hydration, sleep, body measurements, device integrations (Garmin, Apple Health, etc.), barcode scanning, recipes, AI suggestions, photo logging, social features, payments, offline/PWA support, and admin tools.

See `CONTEXT.md` and `docs/adr/` for the domain model and architectural decisions.
