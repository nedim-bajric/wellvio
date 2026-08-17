# Prototype: Unified ADD flow for Diet logging

**Ticket:** https://github.com/nedim-bajric/wellvio/issues/66  
**Parent map:** https://github.com/nedim-bajric/wellvio/issues/64

This is a throwaway design prototype. It explores three structurally different ways to give the user a single primary ADD action for logging food, without the current per-meal-slot buttons.

Open question: which entry-point + flow shape feels right?

---

## Shared assumptions across all variants

- There is **one** primary ADD affordance on the main diet surfaces (`Home`, `Diary`).
- Tapping it opens a flow where the user can either:
  1. Pick a food from the existing catalog (then set grams), or
  2. Quick-add macros directly (title + calories + protein + carbs + fat + grams).
- The entry is tagged with a meal label: Breakfast / Lunch / Dinner / Snacks.
- The daily view is no longer split into four separate meal cards; labels are shown as chips on each entry.

---

## Variant A — FAB → bottom sheet with tabs

### Entry point
A circular floating action button (FAB) anchored to the bottom-right of `Home` and `Diary`.

```
┌─────────────────────────────┐
│  Today          [avatar]    │
│  Good morning               │
│                             │
│     [rings / summary]       │
│                             │
│  Today's meals   View diary │
│  ┌───────────────────────┐  │
│  │ Oatmeal          300  │  │
│  │ Banana           120  │  │
│  │                       │  │
│  │ + 1 more              │  │
│  └───────────────────────┘  │
│                             │
│                    [ + ]    │  <-- FAB
└─────────────────────────────┘
```

### After tap
A bottom sheet slides up with two tabs: **Foods** and **Quick add**.

```
┌─────────────────────────────┐
│        Drag handle          │
│  [ Foods ] [ Quick add ]    │
│  ┌───────────────────────┐  │
│  │ 🔍 Search foods...    │  │
│  │ Recent                │  │
│  │ • Oatmeal        389  │  │
│  │ • Banana         89   │  │
│  │ • Chicken breast 165  │  │
│  │                       │  │
│  │ Create custom food →  │  │
│  └───────────────────────┘  │
│  Add to: [B] [L] [D] [S]    │
│        [   Add entry   ]    │
└─────────────────────────────┘
```

Tapping a food opens the portion step inline or in the same sheet. The meal label defaults to the current time of day but is overridable.

### Quick-add tab
Same sheet, different content:

```
│  [ Foods ] [ Quick add ]    │
│  Title: _______________     │
│  Calories  Protein  Carbs   │
│  [ 300 ]   [ 20 ]   [ 40 ]  │
│  Fat      Grams             │
│  [ 12 ]   [ 150 ]           │
│  Add to: [B] [L] [D] [S]    │
│        [   Quick add   ]    │
```

### Trade-offs
- **Pro:** Always reachable, familiar mobile pattern, keeps context visible.
- **Con:** Bottom sheet can feel cramped with search + keyboard + portion step.

---

## Variant B — Bottom bar "Add" → full-screen modal

### Entry point
A wide, fixed button in the bottom tab bar (or just above it) labeled **Log food**.

```
┌─────────────────────────────┐
│  Today's meals   View diary │
│  ┌───────────────────────┐  │
│  │ Oatmeal          300  │  │
│  │ Banana           120  │  │
│  └───────────────────────┘  │
│                             │
│     [    + Log food    ]    │  <-- Fixed bottom action
│  [Home][Diary][Activity]    │
└─────────────────────────────┘
```

### After tap
A full-screen modal opens with a clear two-path choice.

```
┌─────────────────────────────┐
│  ✕   Log food               │
│                             │
│  ┌───────────────────────┐  │
│  │  🍽️  Choose a food    │  │
│  │     from catalog      │  │
│  └───────────────────────┘  │
│                             │
│         — or —              │
│                             │
│  ┌───────────────────────┐  │
│  │  ⚡ Quick add macros   │  │
│  │     title + nutrients  │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### Choose a food path
Pushes to the existing food search screen, then to a simplified portion screen, then back.

```
┌─────────────────────────────┐
│  ←  Oatmeal                 │
│  389 kcal / 100g            │
│                             │
│        [ 150 ] g            │
│     -  grams  +             │
│                             │
│  584 kcal · P 18 · C 66 ·   │
│            F 12             │
│                             │
│  Label: [B] [L] [D] [S]     │
│     [   Add to diary   ]    │
└─────────────────────────────┘
```

### Quick-add path
A single form:

```
┌─────────────────────────────┐
│  ←  Quick add               │
│  Title: _______________     │
│  Calories  Protein  Carbs   │
│  [ 300 ]   [ 20 ]   [ 40 ]  │
│  Fat       Grams            │
│  [ 12 ]    [ 150 ]          │
│  Label: [B] [L] [D] [S]     │
│     [   Add to diary   ]    │
└─────────────────────────────┘
```

### Trade-offs
- **Pro:** Clear separation of paths, roomy forms, easy to animate.
- **Con:** Full-screen modal covers context; the user loses sight of today's totals while logging.

---

## Variant C — Inline "Add" card on Diary

### Entry point
The `Diary` screen is redesigned as a flat chronological list. At the top is a single sticky input card that expands into the full flow.

```
┌─────────────────────────────┐
│  ←  Aug 14  Today  →        │
│                             │
│  ┌───────────────────────┐  │
│  │  + What did you eat?  │  │
│  │  Search or quick add  │  │
│  └───────────────────────┘  │
│                             │
│  Breakfast                  │
│  • Oatmeal      300 kcal    │
│  • Banana       120 kcal    │
│                             │
│  Lunch                      │
│  • Chicken      450 kcal    │
│                             │
│  ─────────────────────────  │
│  Daily total: 870 kcal      │
└─────────────────────────────┘
```

### After tap
The top card expands in place, revealing the two-path flow.

```
┌─────────────────────────────┐
│  ←  Aug 14  Today  →        │
│                             │
│  ┌───────────────────────┐  │
│  │ 🔍 Search foods...    │  │
│  │                       │  │
│  │ Recent        Quick   │  │
│  │ • Oatmeal     add     │  │
│  │ • Banana      macros  │  │
│  │ • Chicken             │  │
│  │                       │  │
│  │ Title  Cal  P  C  F g │  │
│  │ ____  ___  __ __ __ _ │  │
│  │ [B] [L] [D] [S] [Add] │  │
│  └───────────────────────┘  │
│                             │
│  Breakfast                  │
│  • Oatmeal      300 kcal    │
│                             │
└─────────────────────────────┘
```

Tapping a recent/catalog food opens the portion step inline or as a small overlay. Quick-add fields are always visible below the search.

### Trade-offs
- **Pro:** Everything happens on the diary itself; no navigation context switch.
- **Con:** The top card can get crowded; less suitable for the `Home` dashboard, so `Home` would need a different entry point (FAB or button).

---

## Open decisions this prototype does not settle

1. **Meal label default:** time-of-day heuristic, last-used label, or no default?
2. **Catalog management:** where does the user create/edit custom foods once `FoodCatalogScreen` is no longer reached from `AddFoodScreen`?
3. **Portion step:** inline stepper (Variant A/C) or separate screen (Variant B)?
4. **Home vs Diary entry point:** should both screens have the same ADD affordance, or only one?

---

## Recommendation

Variant A (FAB + bottom sheet) best matches the user's request for "one ADD button (floating or whatever)" and keeps both paths inside a single surface. Variant B is a safer fallback if the sheet feels too cramped on smaller phones. Variant C is worth considering only if the diary becomes the single primary logging surface.
