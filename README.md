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
