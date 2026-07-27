# wellvio

Diet and health tracking app.

## Backend

The NestJS backend lives in `backend/`.

```bash
cd backend
npm install
npm run start:dev   # local dev server with watch
npm test            # unit tests
npm run lint        # ESLint
npm run build       # production build
```

The first implemented domain module is `DietModule`, which exposes pure functions for BMR, TDEE, plan generation with safety caps, target-date feasibility, and nutrient scaling from per-100g values.

## Mobile

The React Native mobile client lives in `mobile/` and is built with Expo.

```bash
cd mobile
npm install
npm run start       # start Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run typecheck   # TypeScript check
```

Set `EXPO_PUBLIC_API_URL` to point at the local backend (defaults to `http://localhost:3000`).
