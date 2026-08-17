# v0 scope boundary for wellvio

We decided to scope the current build to the **Diet module only** and defer Activity and Health modules to future phases. Within Diet, the build includes basic email/password auth through Supabase Auth, profile onboarding, plan generation/activation, a user-scoped food catalog, food logging with meal labels, a daily dashboard and diary, weight logging, and profile/settings. The current build ships with a **React Native mobile app built with Expo** as the primary client.

We chose this boundary to keep the MVP shippable and focused on the core weight-management loop. Activity and Health data add significant integration and UX surface area; deferring them lets us validate the diet experience first. Basic auth is included even though the app is initially personal-use, because the data model already carries `user_id` and adding auth later without a migration is cheaper than retrofitting it.

## Considered options

- **No auth in v0**: Simpler initially, but would require retrofitting `user_id` fields, repository interfaces, and tests later. Rejected because the codebase already models users and the cost of a basic Supabase Auth flow is small.
- **Include Activity or Health in v0**: Would broaden the MVP and require device integrations or manual entry for workouts/sleep. Rejected because it dilutes the core diet value proposition and adds scope without proven need.

## Consequences

- Food, Profile, and Plan remain user-scoped from the start.
- The current build ships with a cross-platform mobile client.
- The current build ships without any third-party integrations.
- Diet calculations and persistence live in the mobile app and talk directly to Supabase.
- Future modules (Activity, Health) must define their own integration points with the Diet module rather than being bolted on later.
