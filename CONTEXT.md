# wellvio — Project context

## Domain model

### Entities

- **User**
  - Profile: current weight, goal weight, activity level, target date.
  - Has one active **Plan** at a time.

- **Plan**
  - Generated from the user's profile.
  - Defines daily targets for: calories, protein, carbs, fat.
  - One of 2–3 preset rates: mild, moderate, aggressive.
  - Capped by safety floors (e.g., 1,200 kcal/day women, 1,500 kcal/day men) and refuses unsafe rates.
  - Target-date feasibility is validated at creation.

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

## Core user flow

1. Onboarding: user enters profile → app calculates TDEE → offers 2–3 safe plans.
2. Plan selection: user picks a plan and target date → app validates feasibility.
3. Daily use: dashboard shows progress against targets and meal-slot budgets.
4. Logging: user picks a Food (catalog or recent), enters grams, assigns a meal slot.
5. Tracking: user logs weight periodically → app compares trend to plan → suggests adjustments.

## v0 scope boundaries

- Nutrients tracked: calories, protein, carbs, fat only.
- Portions: grams only. Pieces and other units are out of v0.
- No recipes and no food suggestions.
- Alerts are visual/passive only; no push notifications.
- Plan adaptation is suggested, not automatic.

## Decisions

- Food is a reusable catalog item; a log entry is a distinct instance.
- Plans are generated from TDEE minus a deficit, with hard safety caps.
- Meal planning in v0 means meal-slot budgeting, not content generation.
