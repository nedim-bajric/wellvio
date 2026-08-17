# Mobile stack: React Native with Expo

## Context

wellvio needs a mobile client so users can log food, view their dashboard, and manage their food catalog on the go. The mobile app talks directly to Supabase for Diet data and auth. A backend may be introduced later if server-side logic is needed.

## Decision

We will build the mobile client with **React Native** and **Expo**.

## Considered options

- **React Native with Expo**: Single TypeScript/JavaScript codebase, over-the-air updates, strong tooling, and easy access to native APIs if needed later. Good fit for a small team shipping iOS and Android together.
- **React Native (bare workflow)**: More flexibility but adds build complexity and maintenance overhead. Rejected because Expo handles the build toolchain and dependencies we need today.
- **Flutter**: Cross-platform and performant, but introduces a Dart ecosystem separate from the backend's TypeScript stack. Rejected to keep the team in one language and reuse domain knowledge.
- **Native iOS (SwiftUI) + Android (Jetpack Compose)**: Best platform integration but requires two codebases and more maintenance. Rejected to keep v0 lean.

## Consequences

- The mobile app lives in a top-level `mobile/` directory.
- Backend API contracts are shared informally via TypeScript types; we will keep DTOs simple to ease client implementation.
- Expo's managed workflow gives us fast iteration and simple builds, with an escape hatch to the bare workflow if we later need custom native modules.
- We accept the Expo/runtime version upgrade cadence as a regular maintenance task.
