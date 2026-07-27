# MyFitnessPal Diet & Nutrition Tracking Research

**Research date:** 2026-07-27

This research is based solely on MyFitnessPal primary sources: the published developer/API documentation at `myfitnesspalapi.com`, the MyFitnessPal Help Center/support articles, and the MyFitnessPal Terms of Service. No secondary blog posts, news articles, or third-party write-ups were used.

---

## 1. Data model for foods, servings, meals, and nutrition logs

### 1.1 API-level diary model

MyFitnessPal’s partner API models a user’s diary as a collection of dated entries. The supported entry types are `diary_meal`, `exercise`, `steps`, `steps_aggregate`, and `water` [[Diary GET](https://myfitnesspalapi.com/docs/diary-get/)]. A food log is represented at the API by a `diary_meal` entry that contains a `diary_meal` string (the meal name) and a calculated `nutritional_contents` object; the public docs do not expose the underlying individual food items inside a meal [[Diary data structure](https://myfitnesspalapi.com/docs/appendix-data-structures-diary/)].

| Field | Type | Meaning |
|-------|------|---------|
| `type` | String | `diary_meal`, `exercise`, `steps`, `steps_aggregate`, `water` |
| `date` | Date (ISO 8601) | The diary date |
| `diary_meal` | String | Meal name for `diary_meal` entries |
| `nutritional_contents` | Nutritional Contents | Aggregated macros/micros for the meal |
| `energy` | Measured Value | Energy expended for exercise/step entries |
| `start_time`, `duration` | Timestamp / Integer | Used for exercise and step entries |

The API also supports creating `water` entries with a date, unit (`milliliters` or `cups`), and positive integer value [[Diary POST](https://myfitnesspalapi.com/docs/diary-post/)].

### 1.2 Nutritional contents schema

The `Nutritional Contents` object is the shared schema for energy and nutrients. `energy` is a `Measured Value` with a unit of `calories` or `kilojoules`; macronutrients are floats in grams; cholesterol, sodium, and potassium are in milligrams; `vitamin_a`, `vitamin_c`, `calcium`, and `iron` are expressed as a percent of the USRDA (0–100) [[Nutritional Contents](https://myfitnesspalapi.com/docs/appendix-data-structures-nutritional-contents/)].

`Measured Value` is a generic `{ value: float, unit: string }` pair used for energy, height, weight, distance, and other quantities [[Measured Value](https://myfitnesspalapi.com/docs/appendix-data-structures-measured-value/)].

### 1.3 User profile and preferences that shape the diary

The user record contains nested preference objects:

- `diary_preferences.meal_names` is a customizable list of meal names. The example default is `["Breakfast", "Lunch", "Dinner", "Snacks"]` [[Diary Preferences](https://myfitnesspalapi.com/docs/appendix-data-structures-diary-preferences/)].
- `goal_preferences` stores `daily_energy_goal` as a `Measured Value` and `daily_step_goal` as an integer [[Goal Preferences](https://myfitnesspalapi.com/docs/appendix-data-structures-goal-preferences/)].
- The user profile stores `birthdate`, `sex` (`M`/`F`), `height` as a `Measured Value`, and `activity_factor` (`sedentary`, `lightly_active`, `active`, `very_active`) [[User Profile](https://myfitnesspalapi.com/docs/appendix-data-structures-user-profile/)].

A sample user response shows the nesting: user → `profiles` → `goal_preferences` / `diary_preferences` [[Example Response with fields](https://myfitnesspalapi.com/docs/example-response-with-fields-parameter/)].

### 1.4 App-level food/serving model

Although the public API returns meal-level aggregates, the support documentation describes the underlying food-entry model:

- Foods are logged under a selected meal. The user can adjust the **serving size** and **number of servings** before saving [[How do I add a food to my food diary?](https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-do-I-add-a-food-to-my-food-diary)].
- If the desired serving size is unavailable, the user enters a fractional number of servings; for example, 0.75 for three-quarters of a cup [[The serving size I need to log is not available](https://support.myfitnesspal.com/hc/en-us/articles/360032272852-The-serving-size-I-need-to-log-is-not-available)].
- Custom foods can be added to the **My Foods** list with a name and nutritional information, so locally produced, homemade, or unusual foods can be logged [[What is included in the free version?](https://support.myfitnesspal.com/hc/en-us/articles/15457546881805-What-is-included-in-the-free-version)].
- **Meals** group foods the user eats together. A meal can contain as few as one food item and may include a meal name, optional photo, optional directions, and food items [[Meal Creation FAQ](https://support.myfitnesspal.com/hc/en-us/articles/360032625331-Meal-Creation-FAQ)].
- **Recipes** are created with a name, number of servings, and ingredient list. Servings can be corrected after cooking [[What is included in the free version?](https://support.myfitnesspal.com/hc/en-us/articles/15457546881805-What-is-included-in-the-free-version)].

| Concept | App-level structure | Public API exposure |
|---------|---------------------|---------------------|
| User | id, username, profiles, preferences | Full resource (`GET /users/:userId`) |
| Food item | Name, serving size, number of servings, meal assignment | Not exposed as a separate resource in the public docs |
| Meal | Customizable list of meal names; each meal contains food items | Returned as a `diary_meal` aggregate with `nutritional_contents` |
| Recipe | Name, number of servings, ingredients | Not exposed as a resource in the public docs |
| Nutrition log | Dated `diary_meal`, `water`, `exercise`, `steps` entries | `GET /diary/`, `POST /diary/` |

> **Limitation:** The public API documentation describes diary entries at the meal level and does not define a per-food-item or per-serving resource. The food/serving details above are derived from the Help Center, not from an API data-structure page.

---

## 2. How daily targets and goals are calculated

### 2.1 Inputs

At profile creation MyFitnessPal asks for age, height, weight, sex, and normal daily activity level. These factors are used to determine the calories required to maintain current weight [[How does MyFitnessPal calculate my initial goals?](https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals)]. The API stores these inputs as `birthdate`, `sex`, `height`, and `activity_factor` in the user profile [[User Profile](https://myfitnesspalapi.com/docs/appendix-data-structures-user-profile/)].

The activity levels are defined as follows [[Macro Calculator](https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator)]:

| Activity level | Description |
|----------------|-------------|
| Sedentary / Not Very Active | Spend most of the day sitting (e.g., desk job) |
| Lightly Active | Spend a good part of the day on your feet (e.g., teacher, salesperson) |
| Active | Spend a good part of the day doing some physical activity (e.g., server, postal worker, nurse) |
| Very Active | Spend most of the day doing heavy physical activity (e.g., bike messenger, carpenter) |

The activity level should cover normal daily routines only; workouts are logged separately [[Macro Calculator](https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator)].

### 2.2 Maintenance calories (TDEE)

MyFitnessPal uses the **Mifflin–St. Jeor equation** to estimate Total Daily Energy Expenditure (TDEE) from the profile inputs [[Nutrition 101: Calories](https://support.myfitnesspal.com/hc/en-us/articles/360032625931-Nutrition-101-Calories)]. The API documentation describes the same concept as `Base Metabolic Rate (BMR) = RMR × PAL`, where Resting Metabolic Rate (RMR) is the calories burned at rest and Physical Activity Level (PAL) ranges from 1.2 for sedentary individuals to 2.4 for extremely active individuals [[Calorie Adjustments](https://myfitnesspalapi.com/docs/appendix-tracking-calorie-adjustments/)].

### 2.3 Weight-loss or weight-gain adjustment

From the maintenance estimate, MyFitnessPal subtracts calories for weight loss or adds calories for weight gain based on the user’s selected weekly rate. The **goal weight** entered during onboarding is used only to report how many pounds remain until the goal is met; it does **not** affect the initial calorie calculation [[How does MyFitnessPal calculate my initial goals?](https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals)].

### 2.4 Net calories and exercise calories

The daily calorie goal is expressed as **Net Calories**:

> Calories Consumed (Food) - Calories Burned (Exercise) = Net Calories

Because the goal already embeds the intended rate of loss or gain, logging additional exercise increases the day’s calorie budget so the planned rate stays stable [[How does MyFitnessPal calculate my initial goals?](https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals)]. When cardio exercise is logged, the added calories are distributed across fat, carbs, and protein; Premium users can turn this off or set a custom macro distribution [[Why do my daily nutrient values and my calorie goal change when I log exercise?](https://support.myfitnesspal.com/hc/en-us/articles/360032623851-Why-do-my-daily-nutrient-values-and-my-calorie-goal-change-when-I-log-exercise)].

### 2.5 Macro, micro, and safety defaults

| Goal / guardrail | Default or rule | Source |
|------------------|-----------------|--------|
| Macronutrient split | 20% protein, 50% carbohydrates, 30% fat | [[A Message about MyFitnessPal's updated nutrition goals](https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals)] [[Macro Calculator](https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator)] |
| Carbohydrate warning | Warns if carbs fall below 130 g/day or below 35% of calories | [[A Message about MyFitnessPal's updated nutrition goals](https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals)] |
| Calorie floor | 1,200 kcal/day for women; 1,500 kcal/day for men | [[How does MyFitnessPal calculate my initial goals?](https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals)] [[A Message about MyFitnessPal's updated nutrition goals](https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals)] |
| Sodium | < 2,300 mg/day | [[A Message about MyFitnessPal's updated nutrition goals](https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals)] |
| Fiber | Females 19–50: 25 g/day; >51: 21 g/day; Males 19–50: 38 g/day; >51: 30 g/day | [[A Message about MyFitnessPal's updated nutrition goals](https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals)] |
| Sugar | ≤ 15% of total calories | [[A Message about MyFitnessPal's updated nutrition goals](https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals)] |
| Custom macros | Must total 100%, adjusted in 5% increments | [[What is included in the free version?](https://support.myfitnesspal.com/hc/en-us/articles/15457546881805-What-is-included-in-the-free-version)] [[Macro Calculator](https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator)] |

---

## 3. How weight loss plans and calorie deficits are structured

- Users select a weekly weight-loss or weight-gain rate during onboarding. MyFitnessPal converts that into a daily calorie adjustment from the maintenance estimate [[How does MyFitnessPal calculate my initial goals?](https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals)] [[Macro Calculator](https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator)].
- Recommended weight-loss rates based on BMI, per NIH guidance cited by MyFitnessPal [[Macro Calculator](https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator)]:
  - BMI ≥ 35 kg/m²: 1–2 lb/week
  - BMI 27–35 kg/m²: 0.5–1 lb/week
  - BMI < 27 kg/m²: 0.5 lb/week
- Maximum recommended calorie deficits by BMI, also per NIH guidance cited by MyFitnessPal [[Nutrition 101: Calories](https://support.myfitnesspal.com/hc/en-us/articles/360032625931-Nutrition-101-Calories)]:
  - BMI < 27: 250 kcal/day
  - BMI 27–35: 500 kcal/day
  - BMI > 35: 1,000 kcal/day
- A 500 kcal/day deficit is conventionally estimated to produce about 1 lb of weight loss per week, though MyFitnessPal notes weight loss is not linear [[Nutrition 101: Calories](https://support.myfitnesspal.com/hc/en-us/articles/360032625931-Nutrition-101-Calories)].
- The goal weight entered at setup is used only for progress reporting; it is not part of the calorie math [[How does MyFitnessPal calculate my initial goals?](https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals)].
- Weekly weigh-ins update the profile and recalculate the net-calorie goal based on the current weight. The user can force a recalculation by confirming the current weight and updating the profile [[How does MyFitnessPal work?](https://support.myfitnesspal.com/hc/en-us/articles/360032626011-How-does-MyFitnessPal-work)] [[How can I force my calorie goals to update?](https://support.myfitnesspal.com/hc/en-us/articles/360032271472-How-can-I-force-my-calorie-goals-to-update)].

---

## 4. Safety guardrails and health disclaimers

### 4.1 Medical disclaimer and age restriction

The MyFitnessPal Terms of Service state that the service is provided for general informational purposes only, that MyFitnessPal is not a medical professional or medical organization, and that it does not provide medical advice or diagnose, treat, cure, mitigate, or prevent disease. Users should consult a physician before beginning any diet or exercise program and should follow their physician’s advice if it conflicts with content in the service [[MyFitnessPal Terms of Service](https://www.myfitnesspal.com/terms-of-service)]. The service is only for users at least 18 years old [[MyFitnessPal Terms of Service](https://www.myfitnesspal.com/terms-of-service)].

### 4.2 Calorie floors and healthy weight-loss messaging

MyFitnessPal recommends minimum daily intakes of 1,200 kcal for women and 1,500 kcal for men, noting that eating too little can produce negative health effects [[How does MyFitnessPal calculate my initial goals?](https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals)]. The Terms of Service explicitly prohibit using the service to promote or achieve “dangerously low levels of eating” and link to additional healthy-eating resources [[MyFitnessPal Terms of Service](https://www.myfitnesspal.com/terms-of-service)].

### 4.3 Eating disorder resources

MyFitnessPal provides a dedicated Eating Disorder Resources page that describes healthy eating, signs of problematic eating, types of eating disorders, and a list of support organizations and helplines. The page notes that relationships with food are not always simple and urges users to seek help if needed [[Eating Disorder Resources](https://support.myfitnesspal.com/hc/en-us/articles/360032625071-Eating-Disorder-Resources)].

### 4.4 Nutrient warnings

Members are notified when daily carbohydrate intake falls below 130 g or below 35% of calories, based on carbohydrates’ role as the primary energy source for the brain [[A Message about MyFitnessPal's updated nutrition goals](https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals)].

### 4.5 Data accuracy and allergy responsibility

The food database contains both MyFitnessPal-entered and member-entered nutritional information. MyFitnessPal does not guarantee accuracy, completeness, or food safety/allergen information, and users are solely responsible for knowing their own allergies and verifying ingredients before consuming products [[MyFitnessPal Terms of Service](https://www.myfitnesspal.com/terms-of-service)].

### 4.6 AI/ML feature caveats

Premium logging features such as Meal Scan use machine learning and computer vision to suggest foods from a photo. MyFitnessPal states these suggestions come from models trained on millions of images and that users choose, adjust, and confirm the result before logging [[Meal Scan FAQ](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-Meal-Scan-FAQ)]. The Terms of Service note that AI-generated outputs may contain errors, misleading information, or biases and should not be relied upon as accurate [[MyFitnessPal Terms of Service](https://www.myfitnesspal.com/terms-of-service)].

---

## 5. Notable UX patterns for logging food quickly

| Pattern | How it works | Availability |
|---------|--------------|--------------|
| **Plus-button launcher** | Tap the “+” on the dashboard, choose a logging method (some require Premium), pick a meal, search, and log or adjust servings [[What is included in the free version?](https://support.myfitnesspal.com/hc/en-us/articles/15457546881805-What-is-included-in-the-free-version)] | All users |
| **Keyword/brand search** | Type a food name or brand; tap the “+” to log immediately or open the item to change serving size and number of servings [[How do I add a food to my food diary?](https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-do-I-add-a-food-to-my-food-diary)] | All users |
| **Search refinement** | Adding terms like “uncooked,” “cooked,” “raw,” or “generic” improves search results [[How do I add a food to my food diary?](https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-do-I-add-a-food-to-my-food-diary)] | All users |
| **Recent / Frequent / My Foods** | The app automatically surfaces recently and frequently logged items; custom foods live in the “My Foods” list [[What is included in the free version?](https://support.myfitnesspal.com/hc/en-us/articles/15457546881805-What-is-included-in-the-free-version)] | All users |
| **Saved Meals / Recipes** | Group foods into reusable Meals or Recipes with a name, servings, and optional photo/directions; log with a checkmark [[How do I create and log remembered meals?](https://support.myfitnesspal.com/hc/en-us/articles/360032272432-How-do-I-create-and-log-remembered-meals)] [[Meal Creation FAQ](https://support.myfitnesspal.com/hc/en-us/articles/360032625331-Meal-Creation-FAQ)] | All users |
| **Multi-Day Logging** | From the food detail screen, add a single item to up to 7 days at once [[Multi-Day Logging](https://support.myfitnesspal.com/hc/en-us/articles/33535658002061-Multi-Day-Logging)] [[What are the features of MyFitnessPal Premium?](https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium)] | Premium |
| **Voice Logging** | Tap “+”, select Voice Log, speak a phrase containing the food, serving, and meal; edit before saving. Requires an internet connection [[Voice Logging](https://support.myfitnesspal.com/hc/en-us/articles/30332897072269-Voice-Logging)] [[What are the features of MyFitnessPal Premium?](https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium)] | Premium, English, app version 24.35.0+ |
| **Meal Scan** | Take or upload a photo; ML/CV suggests verified foods from the database; choose a suggestion, adjust serving, and add to diary [[Meal Scan FAQ](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-Meal-Scan-FAQ)] [[What are the features of MyFitnessPal Premium?](https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium)] | Premium; iOS 17 / Android 12+, app version 22.17+, English |
| **Barcode Scan** | Scan a packaged-food barcode to pull a matching database entry. As of October 1, 2022, barcode scanning is available only with a Premium subscription [[How do I use the barcode scanner to log foods?](https://support.myfitnesspal.com/hc/en-us/articles/360032624771-How-do-I-use-the-barcode-scanner-to-log-foods)] [[What are the features of MyFitnessPal Premium?](https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium)] | Premium |

Additional observations:

- The app remembers liked foods and exercises, and the onboarding copy notes that logging can become as fast as ~30 seconds after a few days [[How does MyFitnessPal work?](https://support.myfitnesspal.com/hc/en-us/articles/360032626011-How-does-MyFitnessPal-work)].
- Voice Logging cannot be used for custom “My Food,” “My Recipes,” or “My Meals” items, nor for Quick Add, weight, exercise, or water entries [[Voice Logging](https://support.myfitnesspal.com/hc/en-us/articles/30332897072269-Voice-Logging)].

---

## 6. Limitations and unverified topics

- **Food/serving API details:** The public API docs return meal-level aggregates (`diary_meal`) and do not define a per-food-item, per-serving, or recipe resource. Food-item and serving-size behavior is documented from the Help Center, not from an API data-structure page.
- **Third-party wearable integrations:** The Help Center describes partner calorie adjustments conceptually; the detailed per-partner sync behavior was not verified because it is partner-specific and outside the scope of diet/nutrition logging.
- **Premium pricing and regional tiers:** Exact prices or regional feature differences were not researched; only feature availability (Premium vs. free) was verified from support articles.

---

## References

1. MyFitnessPal Developer API documentation — `https://myfitnesspalapi.com/docs/` (accessed 2026-07-27)
2. Diary GET — `https://myfitnesspalapi.com/docs/diary-get/` (accessed 2026-07-27)
3. Diary POST — `https://myfitnesspalapi.com/docs/diary-post/` (accessed 2026-07-27)
4. Appendix: Diary data structure — `https://myfitnesspalapi.com/docs/appendix-data-structures-diary/` (accessed 2026-07-27)
5. Appendix: Nutritional Contents — `https://myfitnesspalapi.com/docs/appendix-data-structures-nutritional-contents/` (accessed 2026-07-27)
6. Appendix: Measured Value — `https://myfitnesspalapi.com/docs/appendix-data-structures-measured-value/` (accessed 2026-07-27)
7. Appendix: User — `https://myfitnesspalapi.com/docs/appendix-data-structures-user/` (accessed 2026-07-27)
8. Appendix: User Profile — `https://myfitnesspalapi.com/docs/appendix-data-structures-user-profile/` (accessed 2026-07-27)
9. Appendix: Goal Preferences — `https://myfitnesspalapi.com/docs/appendix-data-structures-goal-preferences/` (accessed 2026-07-27)
10. Appendix: Diary Preferences — `https://myfitnesspalapi.com/docs/appendix-data-structures-diary-preferences/` (accessed 2026-07-27)
11. Example Response with fields — `https://myfitnesspalapi.com/docs/example-response-with-fields-parameter/` (accessed 2026-07-27)
12. Appendix: Calorie Adjustments — `https://myfitnesspalapi.com/docs/appendix-tracking-calorie-adjustments/` (accessed 2026-07-27)
13. How do I add a food to my food diary? — `https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-do-I-add-a-food-to-my-food-diary` (accessed 2026-07-27)
14. The serving size I need to log is not available — `https://support.myfitnesspal.com/hc/en-us/articles/360032272852-The-serving-size-I-need-to-log-is-not-available` (accessed 2026-07-27)
15. What is included in the free version? — `https://support.myfitnesspal.com/hc/en-us/articles/15457546881805-What-is-included-in-the-free-version` (accessed 2026-07-27)
16. How do I create and log remembered meals? — `https://support.myfitnesspal.com/hc/en-us/articles/360032272432-How-do-I-create-and-log-remembered-meals` (accessed 2026-07-27)
17. Meal Creation FAQ — `https://support.myfitnesspal.com/hc/en-us/articles/360032625331-Meal-Creation-FAQ` (accessed 2026-07-27)
18. Multi-Day Logging — `https://support.myfitnesspal.com/hc/en-us/articles/33535658002061-Multi-Day-Logging` (accessed 2026-07-27)
19. Voice Logging — `https://support.myfitnesspal.com/hc/en-us/articles/30332897072269-Voice-Logging` (accessed 2026-07-27)
20. Meal Scan FAQ — `https://support.myfitnesspal.com/hc/en-us/articles/360045761612-Meal-Scan-FAQ` (accessed 2026-07-27)
21. How do I use the barcode scanner to log foods? — `https://support.myfitnesspal.com/hc/en-us/articles/360032624771-How-do-I-use-the-barcode-scanner-to-log-foods` (accessed 2026-07-27)
22. What are the features of MyFitnessPal Premium? — `https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium` (accessed 2026-07-27)
23. How does MyFitnessPal calculate my initial goals? — `https://support.myfitnesspal.com/hc/en-us/articles/360032625391-How-does-MyFitnessPal-calculate-my-initial-goals` (accessed 2026-07-27)
24. Macro Calculator — `https://support.myfitnesspal.com/hc/en-us/articles/24763932864397-Macro-Calculator` (accessed 2026-07-27)
25. Nutrition 101: Calories — `https://support.myfitnesspal.com/hc/en-us/articles/360032625931-Nutrition-101-Calories` (accessed 2026-07-27)
26. Why do my daily nutrient values and my calorie goal change when I log exercise? — `https://support.myfitnesspal.com/hc/en-us/articles/360032623851-Why-do-my-daily-nutrient-values-and-my-calorie-goal-change-when-I-log-exercise` (accessed 2026-07-27)
27. A Message about MyFitnessPal's updated nutrition goals — `https://support.myfitnesspal.com/hc/en-us/articles/360032626031-A-Message-about-MyFitnessPal-s-updated-nutrition-goals` (accessed 2026-07-27)
28. How does MyFitnessPal work? — `https://support.myfitnesspal.com/hc/en-us/articles/360032626011-How-does-MyFitnessPal-work` (accessed 2026-07-27)
29. How can I force my calorie goals to update? — `https://support.myfitnesspal.com/hc/en-us/articles/360032271472-How-can-I-force-my-calorie-goals-to-update` (accessed 2026-07-27)
30. Eating Disorder Resources — `https://support.myfitnesspal.com/hc/en-us/articles/360032625071-Eating-Disorder-Resources` (accessed 2026-07-27)
31. MyFitnessPal Terms of Service — `https://www.myfitnesspal.com/terms-of-service` (accessed 2026-07-27)
