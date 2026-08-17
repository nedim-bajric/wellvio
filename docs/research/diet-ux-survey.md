# Diet UX and Data Model Survey

**Ticket:** https://github.com/nedimbajric/wellvio/issues/65  
**Parent map:** https://github.com/nedimbajric/wellvio/issues/64 – "Redesign Diet logging UX around one ADD button"

This note surveys the current Diet module implementation as it exists in the repo today. All claims cite source file paths and line numbers.

---

## 1. Screens that touch food logging or the daily diet view

### `mobile/src/screens/main/DiaryScreen.tsx`
- **Purpose:** The primary daily diet view. Shows a 5-day date selector, four meal-slot cards (Breakfast, Lunch, Dinner, Snacks), each slot’s calories vs. a budget, the logged food list inside each slot, and a daily macro summary.
- **Entry points:**
  - Bottom tab `"Diary"` (`MainNavigator.tsx:110`).
  - `HomeScreen` "View diary" action and per-slot "View all" buttons (`HomeScreen.tsx:455`, `488`).
- ** mealSlot usage:** It iterates `mealSlots` (`DiaryScreen.tsx:41`) and routes each slot’s add button to `navigation.navigate('AddFood', { mealSlot: slot })` (`DiaryScreen.tsx:210`). It also buckets `entries` by `entry.mealSlot` (`DiaryScreen.tsx:94-102`).

### `mobile/src/screens/main/AddFoodScreen.tsx`
- **Purpose:** Food picker / search. Has search, tab filters (Recent/Frequent/My Foods/Database), a "Quick add calories & macros" shortcut, and a list of foods. Selecting a food opens `FoodDetail`; empty search offers `FoodCatalog`.
- **Entry points:**
  - Per-slot add buttons from `DiaryScreen` and `HomeScreen` (`DiaryScreen.tsx:210`, `HomeScreen.tsx:503-507`).
  - It is registered as a root modal screen (`RootNavigator.tsx:57`).
- **mealSlot usage:** Accepts `route.params?.mealSlot` (`AddFoodScreen.tsx:42`) and forwards it to `QuickAdd` (`AddFoodScreen.tsx:175`) and `FoodDetail` (`AddFoodScreen.tsx:209-212`).

### `mobile/src/screens/main/QuickAddScreen.tsx`
- **Purpose:** Manual macro entry without a food catalog item. Inputs calories, protein, carbs, fat and picks a meal slot.
- **Entry points:**
  - "Quick add calories & macros" row inside `AddFoodScreen` (`AddFoodScreen.tsx:174-189`).
  - Registered as root screen (`RootNavigator.tsx:59`).
- **mealSlot usage:** Defaults to the incoming `route.params?.mealSlot` or `'lunch'` (`QuickAddScreen.tsx:51-53`), then posts a `logEntryApi.create` with `grams: 0`, the chosen `mealSlot`, and manually supplied `nutrients` (`QuickAddScreen.tsx:72-82`).

### `mobile/src/screens/main/FoodDetailScreen.tsx`
- **Purpose:** Serving-size editor for a catalog food. Shows per-100g nutrition, a grams stepper, calculated nutrition for the chosen portion, and a meal-slot selector.
- **Entry points:**
  - Tapping a food row in `AddFoodScreen` (`AddFoodScreen.tsx:205-213`).
  - Registered as root screen (`RootNavigator.tsx:58`).
- **mealSlot usage:** Defaults to `route.params.mealSlot ?? 'breakfast'` (`FoodDetailScreen.tsx:40`), lets the user override it, then posts `logEntryApi.create` with `foodId`, `grams`, and `mealSlot` (`FoodDetailScreen.tsx:74-79`).

### `mobile/src/screens/main/HomeScreen.tsx`
- **Purpose:** Dashboard. Rings for remaining calories, macro chips, daily totals, and a "Today's meals" section that mirrors the four meal slots with per-slot budgets and the top 3 entries.
- **Entry points:** Bottom tab `"Home"` (`MainNavigator.tsx:105`).
- **mealSlot usage:** It builds `entriesBySlot` (`HomeScreen.tsx:182-190`) and renders `dashboard.mealSlots`. Each slot card has an add button that passes its slot to `AddFood` (`HomeScreen.tsx:503-507`).

### `mobile/src/screens/FoodCatalogScreen.tsx`
- **Purpose:** CRUD screen for the user’s custom food catalog (list, create, edit, delete foods). It does **not** log food or know about meal slots.
- **Entry points:** Reached from `AddFoodScreen` empty state via `navigation.navigate('FoodCatalog')` (`AddFoodScreen.tsx:198`). Registered as root screen (`RootNavigator.tsx:60`).

### `mobile/src/screens/LogEntryScreen.tsx`
- **Purpose:** Legacy food logger. Picks a food from a modal, enters grams, selects a meal slot from `MEAL_SLOTS`, and submits. It is a standalone screen that is **not** wired into the current `AddFood → FoodDetail` flow.
- **Entry points:** Not directly referenced in current navigators; it imports `MainTabParamList` and navigates back to `"Home"` on success (`LogEntryScreen.tsx:22-23`, `102`).
- **mealSlot usage:** Hard-codes local `mealSlot` state (`LogEntryScreen.tsx:34`, `131-152`) and posts `logEntryApi.create` with `foodId`, `grams`, `mealSlot` (`LogEntryScreen.tsx:92-97`).

### `mobile/src/screens/DashboardScreen.tsx`
- **Purpose:** Older dashboard that only shows totals and meal-slot summaries. It is **not** the main home screen in use today (the active home screen is `HomeScreen`).
- **Entry points:** Button-only navigation from older flows; not part of the current redesign path.
- **mealSlot usage:** Reads `dashboard.mealSlots` and renders each `MealSlotSummary` (`DashboardScreen.tsx:96-107`).

---

## 2. Navigation routes and params that pass `mealSlot`

### `mobile/src/navigation/types.ts`
- `MealSlot` is imported from `../types/logEntry` (`types.ts:1`).
- Root-level screens that carry `mealSlot`:
  - `AddFood: { mealSlot?: MealSlot } | undefined` (`types.ts:74`).
  - `FoodDetail: { foodId: string; mealSlot?: MealSlot }` (`types.ts:75`).
  - `QuickAdd: { mealSlot?: MealSlot } | undefined` (`types.ts:76`).
- The nested `HomeStackParamList` and `DiaryStackParamList` also declare these same screens (`types.ts:28-41`), but the actual registrations in `RootNavigator` use the root-level names.

### `mobile/src/navigation/RootNavigator.tsx`
- Registers `AddFood`, `FoodDetail`, and `QuickAdd` as stack screens (`RootNavigator.tsx:57-59`). No other navigator registers them, so the root routes are the live entry points.

### `mobile/src/navigation/MainNavigator.tsx`
- Registers the bottom tabs `Home` and `Diary` (`MainNavigator.tsx:105-111`). Those tabs are the launch points for the root add-food screens described above.

---

## 3. `LogEntry`, `Food`, and `CreateLogEntryData` type definitions

### `mobile/src/types/logEntry.ts`
```ts
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export interface LogEntry {
  id: string;
  userId: string;
  foodId: string;
  foodName: string;
  grams: number;
  nutrients: Nutrients;
  mealSlot: MealSlot;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogEntryData {
  foodId?: string;
  grams: number;
  mealSlot: MealSlot;
  loggedAt?: string;
  nutrients?: Nutrients;
}
```
- `LogEntry` always has a non-optional `foodId` and `mealSlot` (`logEntry.ts:7-18`).
- `CreateLogEntryData` makes `foodId` optional so quick-add can omit it, and adds optional `nutrients` for the same case (`logEntry.ts:20-26`).

### `mobile/src/types/food.ts`
```ts
export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Food {
  id: string;
  userId: string;
  name: string;
  nutrientsPer100g: Nutrients;
  createdAt: string;
  updatedAt: string;
}
```
- `Food` stores only per-100g values (`food.ts:8-15`). Portion math is done at log time.

### How quick-add differs from catalog entries
- **Catalog entry:** `foodId` is provided, `nutrients` is omitted. The API looks up the food and scales per-100g values by `grams`.
- **Quick-add entry:** `foodId` is omitted, `nutrients` is provided directly, and the screen sends `grams: 0` (`QuickAddScreen.tsx:72-82`). The API stores `foodName = 'Quick add'` and the supplied macros.

### Backend types (`backend/src/log-entry/log-entry.types.ts`)
```ts
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export interface LogEntry { ... mealSlot: MealSlot; ... }
export interface CreateLogEntryData {
  foodId: string;
  grams: number;
  mealSlot: MealSlot;
  loggedAt?: Date | string;
}
```
- The backend `CreateLogEntryData` currently **requires** `foodId` and has no `nutrients` or title field (`log-entry.types.ts:20-25`). This is a constraint if the mobile quick-add path is ever moved to the backend API.

---

## 4. `logEntryApi.create` behavior for food-linked vs nutrient-only entries

### `mobile/src/api/logEntryApi.ts`

The `create` function branches on the presence of `data.nutrients`:

1. **Nutrient-only (quick-add) path** (`logEntryApi.ts:257-260`):
   - `foodName = 'Quick add'`
   - `nutrients = data.nutrients`
   - `foodId` remains undefined and is stored as `null` via `toCreateRow` (`logEntryApi.ts:75`).

2. **Food-linked path** (`logEntryApi.ts:261-282`):
   - Fetches the food row from Supabase (`logEntryApi.ts:262-266`).
   - Sets `foodName = food.name` and `foodId = data.foodId`.
   - Scales per-100g macros with `scaleNutrients(..., data.grams)` (`logEntryApi.ts:274-282`).

3. **Legacy fallback** (`logEntryApi.ts:283-292`):
   - If neither `nutrients` nor `foodId` is present, treats `grams` as calories and stores `foodName = 'Quick add'`.

`toCreateRow` inserts `food_id: data.foodId || null`, `food_name`, `grams`, the scaled nutrients, `meal_slot`, and `logged_at` (`logEntryApi.ts:70-85`).

The `update` method only rescales nutrition when both `data.grams` and `data.foodId` are present and `foodId !== 'quick-add'` (`logEntryApi.ts:326-351`).

---

## 5. Tests and backend constraints affecting meal-slot removal or quick-add titles

### Mobile tests
- `mobile/src/utils/diet.test.ts` tests BMR/TDEE/plan generation, feasibility, and `scaleNutrients`. It does **not** reference `MealSlot`, `LogEntry`, or UI flow. It will not block removing meal-slot separation, but any UI budget math that relies on `slotBudgetRatios` (e.g. `DiaryScreen.tsx:34-39`, `HomeScreen.tsx:41-46`) would need to move or be removed.

### Supabase schema (`supabase/migrations/20250814000001_add_diet_tables.sql`)
- `log_entries.meal_slot` is `text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snacks'))` (`add_diet_tables.sql:64`).
- `log_entries.food_id` is nullable (`add_diet_tables.sql:57`), but `food_name` is `not null` (`add_diet_tables.sql:58`).
- **Implication:** Removing meal-slot separation requires a schema migration to drop/alter the `meal_slot` constraint. Adding a user-editable quick-add title is already data-compatible because `food_name` is a free text column and the mobile client writes `"Quick add"` today.

### Backend NestJS module (`backend/src/log-entry/`)
- `LogEntryService.create` requires a food to exist (`log-entry.service.ts:56-57`, `156-161`).
- `LogEntry` type in the backend requires `foodId: string` and stores no quick-add title or direct nutrient override (`log-entry.types.ts:7-18`, `20-25`).
- `getDailyDashboard` hard-codes four `MealSlotSummary` buckets using `MEAL_SLOTS` (`log-entry.service.ts:123-128`).
- `InMemoryLogEntryRepository` stores `foodId`, `mealSlot`, etc., and does not support nutrient-only creation (`log-entry.in-memory.repository.ts:19-35`).
- **Implication:** If the redesign keeps the mobile app talking directly to Supabase, only the mobile code and the Supabase migration matter. If the redesign intends to use the backend `log-entries` controller, the backend types/service/repo must be extended to support nutrient-only entries and optional meal slots / titles.

### Backend tests
- `backend/src/log-entry/log-entry.service.spec.ts` and `log-entry.controller.spec.ts` assume `foodId` and `mealSlot` are always present and assert a 4-slot dashboard (`log-entry.service.spec.ts:206-249`). These tests would need updates if the data model changes.

---

## Summary of key findings

1. **Meal slots are pervasive in the current UI.** `DiaryScreen` and `HomeScreen` both render four fixed slot buckets and pass the slot into `AddFood → FoodDetail/QuickAdd`. Removing slots touches `types.ts`, both screens, `QuickAddScreen`, `FoodDetailScreen`, and the Supabase schema.
2. **There are already multiple ADD affordances.** Per-slot plus buttons exist in `DiaryScreen` and `HomeScreen`, plus a "Quick add" shortcut inside `AddFoodScreen`. Consolidating to one ADD button is a UI simplification, not a data-model change.
3. **Quick-add is already implemented in mobile, but not in backend.** Mobile `logEntryApi.create` supports nutrient-only entries with `foodName = 'Quick add'`. The backend `LogEntryService` does not.
4. **Custom quick-add titles are data-feasible today.** `log_entries.food_name` is a free `text not null` column; the API just needs to accept and forward a title.
5. **The biggest migration risk is the `meal_slot` check constraint.** `supabase/migrations/20250814000001_add_diet_tables.sql:64` restricts the column to the four current enum values, so any redesign that removes or renames slots needs a schema migration and dashboard rebuild.
