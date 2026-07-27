# v0 scope boundary for wellvio

We decided to scope v0 to the **Diet module only** and defer Activity and Health modules to the full vision. Within Diet, v0 includes basic email/password + JWT auth, profile onboarding, plan generation/activation, a user-scoped food catalog, food logging by meal slot, a daily dashboard, weight logging, and suggested plan adaptations. v0 ships with a **React Native mobile app built with Expo** as the primary client.

We chose this boundary to keep the MVP shippable and focused on the core weight-management loop. Activity and Health data add significant integration and UX surface area; deferring them lets us validate the diet experience first. Basic auth is included in v0 even though the app is initially personal-use, because the data model already carries `userId` and adding auth later without a migration is cheaper than retrofitting it.

## Considered options

- **No auth in v0**: Simpler initially, but would require retrofitting `userId` fields, repository interfaces, and tests later. Rejected because the codebase already models users and the cost of a basic JWT flow is small.
- **Include Activity or Health in v0**: Would broaden the MVP and require device integrations or manual entry for workouts/sleep. Rejected because it dilutes the core diet value proposition and adds scope without proven need.

## Consequences

- Food, Profile, and Plan remain user-scoped from the start.
- v0 ships with a cross-platform mobile client in addition to the NestJS backend.
- v0 ships without any third-party integrations.
- Future modules (Activity, Health) must define their own integration points with the Diet module rather than being bolted on later.
