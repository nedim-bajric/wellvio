# Prototype: Flat-list Diary redesign

**Ticket:** https://github.com/nedim-bajric/wellvio/issues/68  
**Parent map:** https://github.com/nedim-bajric/wellvio/issues/64  
**Depends on:** meal-label decision in https://github.com/nedim-bajric/wellvio/issues/67 and ADD-flow decision in https://github.com/nedim-bajric/wellvio/issues/66

This is a throwaway design prototype. It explores three ways to show the daily food log once the four meal-slot cards are removed and entries are tagged with meal labels.

Open question: how should the new `DiaryScreen` balance the daily summary against the entry list?

---

## Shared assumptions

- Meal separation is gone (decided in #67).
- Entries have a meal label chip: Breakfast / Lunch / Dinner / Snacks.
- The single ADD affordance is the FAB from Variant A in #66.
- The daily view focuses on daily total vs. daily target, not per-slot budgets.

---

## Variant A — Summary card + flat list

A daily summary card sits at the top, followed by a chronological list of entries.

```
┌─────────────────────────────┐
│  ←  Aug 14  Today  →        │
│                             │
│  ┌───────────────────────┐  │
│  │  1,420 / 2,000 kcal   │  │
│  │  [===========>       ] │  │
│  │  P 110/150  C 160/250 │  │
│  │  F 55/70              │  │
│  └───────────────────────┘  │
│                             │
│  Today                      │
│  ┌───────────────────────┐  │
│  │ Oatmeal          300  │  │
│  │ [Breakfast] 150g      │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Banana           120  │  │
│  │ [Breakfast] 120g      │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Chicken & rice   450  │  │
│  │ [Lunch] 300g          │  │
│  └───────────────────────┘  │
│                             │
│                    [ + ]    │  <-- FAB
└─────────────────────────────┘
```

### Pros
- Mirrors the existing mental model: summary first, details below.
- Easy to scan totals and then drill into entries.
- Reuses existing card and progress components.

### Cons
- Summary takes up significant vertical space before the list.
- Less room for entries on small screens.

---

## Variant B — Inline totals + list

Daily totals are shown as a compact sticky header; the list takes most of the screen.

```
┌─────────────────────────────┐
│  ←  Aug 14  Today  →        │
│  1,420 / 2,000 kcal · 580 left│
├─────────────────────────────┤
│  Oatmeal              300   │
│  [Breakfast] 150g           │
│                             │
│  Banana               120   │
│  [Breakfast] 120g           │
│                             │
│  Chicken & rice       450   │
│  [Lunch] 300g               │
│                             │
│  Yogurt               150   │
│  [Snacks] 170g              │
│                             │
│                    [ + ]    │  <-- FAB
└─────────────────────────────┘
```

### Pros
- Maximum screen real estate for the log.
- Clean, minimal, scannable.

### Cons
- Macro breakdown (P/C/F) is hidden or requires tapping the totals.
- Less visually rich; may feel like a downgrade from the current dashboard.

---

## Variant C — Sectioned by label

Entries are still grouped under meal labels, but as compact inline sections rather than full cards.

```
┌─────────────────────────────┐
│  ←  Aug 14  Today  →        │
│                             │
│  1,420 / 2,000 kcal         │
│  P 110  C 160  F 55         │
│                             │
│  Breakfast — 420 kcal       │
│  • Oatmeal          300     │
│    150g                     │
│  • Banana           120     │
│    120g                     │
│                             │
│  Lunch — 450 kcal           │
│  • Chicken & rice   450     │
│    300g                     │
│                             │
│  Snacks — 150 kcal          │
│  • Yogurt           150     │
│    170g                     │
│                             │
│                    [ + ]    │  <-- FAB
└─────────────────────────────┘
```

### Pros
- Preserves some meal-time grouping without the heavy card UI.
- Makes it easy to see what was eaten when.

### Cons
- Still visually separates meals, which the user explicitly wanted to avoid.
- More complex layout than a pure flat list.

---

## Recommendation

**Variant A — Summary card + flat list.**

It keeps the daily summary prominent (the user still needs to track targets) while removing the four separated meal cards. The meal label is reduced to a small chip, which matches the “okay as label to know, but not necessary” intent.

If screen space becomes an issue on smaller phones, Variant B is the fallback.
