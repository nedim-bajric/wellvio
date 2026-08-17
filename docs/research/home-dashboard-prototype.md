# Prototype: Home dashboard without meal-slot cards

**Ticket:** https://github.com/nedim-bajric/wellvio/issues/69  
**Parent map:** https://github.com/nedim-bajric/wellvio/issues/64  
**Depends on:** meal-label decision in https://github.com/nedim-bajric/wellvio/issues/67, ADD-flow decision in https://github.com/nedim-bajric/wellvio/issues/66

This is a throwaway design prototype. It explores three ways to redesign the `HomeScreen` dashboard once the four "Today's meals" cards are removed.

Open question: how should the home dashboard balance the calorie ring, macro summary, and today's log now that meal-slot cards are gone?

---

## Shared assumptions

- Meal separation is gone (decided in #67).
- The single ADD affordance is the FAB from Variant A in #66.
- The home screen should still show progress toward the daily plan.

---

## Variant A — Rings + macros + recent entries

Keep the existing rings and macro chips, but replace the four meal cards with a compact "Recent entries" list and a link to the full diary.

```
┌─────────────────────────────┐
│  Mon, Aug 14    [avatar]    │
│  Good morning               │
│                             │
│         [ rings ]           │
│       580 kcal left         │
│                             │
│  [Protein] [Carbs] [Fat]    │
│     110/150  160/250  55/70 │
│                             │
│  Today's food        View → │
│  ┌───────────────────────┐  │
│  │ Oatmeal          300  │  │
│  │ [Breakfast]           │  │
│  │ Banana           120  │  │
│  │ [Breakfast]           │  │
│  │ Chicken & rice   450  │  │
│  │ [Lunch]               │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Log today's weight → │  │
│  └───────────────────────┘  │
│                             │
│                    [ + ]    │  <-- FAB
└─────────────────────────────┘
```

### Pros
- Keeps the visual identity of the existing home screen.
- Recent entries give immediate feedback after logging.
- Clear call-to-action to the full diary.

### Cons
- Still information-dense; rings + macros + list compete for attention.

---

## Variant B — Summary-first dashboard

A cleaner dashboard that emphasizes remaining calories and macros, with only a small hint of recent entries.

```
┌─────────────────────────────┐
│  Mon, Aug 14    [avatar]    │
│  Good morning               │
│                             │
│         [ rings ]           │
│       580 kcal left         │
│       of 2,000 goal         │
│                             │
│  ┌───────────────────────┐  │
│  │ Calories  1,420/2,000 │  │
│  │ Protein     110/150   │  │
│  │ Carbs       160/250   │  │
│  │ Fat           55/70   │  │
│  └───────────────────────┘  │
│                             │
│  Last logged: Chicken & rice│
│  450 kcal · [Lunch]         │
│                             │
│  [    View today's diary    │
│              →    ]         │
│                             │
│                    [ + ]    │  <-- FAB
└─────────────────────────────┘
```

### Pros
- Clean, scannable, less clutter.
- Clear primary metric (calories left) and secondary macros.

### Cons
- Loses the at-a-glance list of everything eaten today.
- Requires an extra tap to see the full log.

---

## Variant C — Diary as home

The home screen becomes a simplified version of the diary itself: date, totals, and flat list, with the diary tab possibly removed or merged.

```
┌─────────────────────────────┐
│  Mon, Aug 14    [avatar]    │
│  1,420 / 2,000 kcal         │
│  P 110  C 160  F 55         │
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
- One screen for daily progress and log.
- Simple, direct, easy to understand.

### Cons
- May duplicate the dedicated Diary tab.
- Less room for motivational/progress widgets.

---

## Recommendation

**Variant A — Rings + macros + recent entries.**

It preserves the app's current dashboard character while removing the four meal-slot cards. The recent-entries card satisfies the need to see today's food at a glance without separating meals, and the "View" link keeps the dedicated Diary tab useful.
