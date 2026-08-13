# Mobile Toast Notification Library Comparison for Wellvio

**Project context:** Wellvio v0 is a React Native + Expo mobile app for diet tracking. It currently uses inline red labels under `WvInput` fields plus a generic `getErrorMessage` helper and an ad-hoc auth error banner. The goal is to evaluate a cross-platform toast library for ephemeral feedback that can supplement (not necessarily replace) inline field errors.

**Constraints:** Expo SDK ~57.0.8, React Native 0.86.0, React 19.2.3. The app uses `react-native-safe-area-context` and `react-native-screens` already, and has a custom theme in `mobile/src/theme` (`ThemeColors`, light/dark palettes). No push notifications in v0.

**Evaluation date:** August 2026

---

## 1. Candidate libraries

The libraries evaluated are the ones most commonly recommended in the Expo/RN ecosystem:

| Library | Approach | Native code | Stars (Aug 2026) | Last publish |
|---------|----------|-------------|------------------|--------------|
| [sonner-native](https://github.com/gunnartorfis/sonner-native) | JS component, Sonner-style stacking | No | 1,328 | 2026-08-13 |
| [react-native-toast-message](https://github.com/calintamas/react-native-toast-message) | JS component, single toast | No | 2,142 | 2026-07-07 |
| [burnt](https://github.com/nandorojo/burnt) | Native iOS/Android toasts via Expo module | Yes | 1,558 | 2025-03-10 |
| [react-native-flash-message](https://github.com/lucasferreira/react-native-flash-message) | JS component, single flashbar | No | 1,530 | 2023-08-09 |
| [react-native-root-toast](https://github.com/magicismight/react-native-root-toast) | JS component, portal-based | No | 2,136 | 2025-03-25 |
| [react-native-notifier](https://github.com/seniv/react-native-notifier) | JS component, banner notifications | No | 1,435 | 2024-07-21 |

---

## 2. Expo SDK 57 / React Native 0.86 compatibility

Expo SDK 57 ships React Native 0.86 with no user-facing breaking changes from 0.85 [[Expo SDK 57 Changelog](https://docs.expo.dev/workflow/upgrading/)][[Expo SDK 57 release notes](https://expo.dev/changelog/sdk-57)]. The New Architecture is the default in recent Expo SDKs; any library that relies on the legacy bridge or un-maintained native modules is a risk.

| Library | Expo Go | New Architecture | RN 0.86 notes |
|---------|---------|------------------|---------------|
| **sonner-native** | Yes (JS-only) | Supported by peer deps (Reanimated 3 / Worklets) | `peerDependencies` are loose (`react: *`, `react-native: *`) but require Reanimated ≥4.1.1, Gesture Handler ≥2.28.0, Screens ≥4.16, Worklets ≥0.6.1, SVG ≥15.12.1, Safe Area ≥5.6.0 [[sonner-native package.json](https://www.npmjs.com/package/sonner-native)]. These ranges line up with Expo SDK 57's bundled versions. |
| **react-native-toast-message** | Yes (JS-only) | No native code, generally safe | `peerDependencies` are just `react: *` and `react-native: *` [[npm](https://www.npmjs.com/package/react-native-toast-message)]. No explicit RN 0.86 blockers, but open issues report animation problems on newer Expo versions [[react-native-toast-message #583](https://github.com/calintamas/react-native-toast-message/issues/583)]. |
| **burnt** | No (requires dev build / prebuild) | Claims "works with both old & new architectures" via Expo Modules [[Burnt README](https://github.com/nandorojo/burnt)] | Uses native iOS (`SPIndicator`/`AlertKit`) and `ToastAndroid`. Requires `npx expo prebuild` and rebuild. Open issues include Android reliability and styling limitations [[Burnt issues](https://github.com/nandorojo/burnt/issues)]. |
| **react-native-flash-message** | Yes (JS-only) | No native code | Last published 2023; `devDependencies` pin RN 0.64.3 [[npm](https://www.npmjs.com/package/react-native-flash-message)]. No known RN 0.86 crash, but maintenance is stale and it is not actively tested on modern RN. |
| **react-native-root-toast** | Yes (JS-only) | Uses `react-native-root-siblings`; historically fragile with RN LogBox/modals | Expo docs still list it as the cross-platform recommendation, but an open Expo issue flags it as unmaintained and problematic on recent Expo/RN versions [[expo/expo #33581](https://github.com/expo/expo/issues/33581)][[react-native-root-toast #175](https://github.com/magicismight/react-native-root-toast/issues/175)]. |
| **react-native-notifier** | Yes (JS-only) | No native code | Requires `react-native-gesture-handler` peer. Latest stable is 2.0.0 (Jul 2024); v3 is in RC since Jan 2025 with no stable release. Open issues include a deprecation warning for `SafeAreaView` and a Gesture Handler functional-component error [[react-native-notifier #111](https://github.com/seniv/react-native-notifier/issues/111)][[#110](https://github.com/seniv/react-native-notifier/issues/110)]. |

**Verdict on compatibility:** `sonner-native`, `react-native-toast-message`, and `react-native-flash-message` are the safest pure-JS choices for Expo Go and CNG. `burnt` is viable only if the team accepts dev-build/prebuild complexity. `react-native-root-toast` and `react-native-notifier` carry higher maintenance/bug risks for SDK 57.

---

## 3. Feature comparison

### 3.1 Theming and design-system fit

Wellvio's theme exposes semantic colors (`success`, `error`, `warning`, `info` equivalents) and radii/spacing tokens in `mobile/src/theme/colors.ts` and `mobile/src/theme/index.ts`.

| Library | Style override | Dark mode | Design-system fit |
|---------|----------------|-----------|-------------------|
| **sonner-native** | Global `toastStyles`, per-variant `variantStyles`, per-toast `styles` props [[docs](https://sonner-native.netlify.app/)] | Built-in `theme="light|dark|system"` | Excellent. Can map `error`/`success`/`warning` to Wellvio's palette and keep border radii/spacing consistent. |
| **react-native-toast-message** | Custom layouts via `config` prop; base style props limited | Manual via custom layout | Good with effort. Requires writing a custom type/renderer to match the design system exactly. |
| **burnt** | Very limited: preset icons, `layout.iconSize`, `haptic`, `from`, duration | Native iOS dark mode only | Poor for a custom design system. Uses native iOS alert/toast chrome; styling is essentially locked. |
| **react-native-flash-message** | `style`, `titleStyle`, `textStyle`, `renderCustomContent`, `renderFlashMessageIcon` | Manual | Good. Straightforward to override colors and shape, but only one message at a time. |
| **react-native-root-toast** | `backgroundColor`, `textColor`, `shadow`, `opacity`, position number | Manual | Moderate. Very basic styling; looks dated out of the box. |
| **react-native-notifier** | Full custom `Component` plus `componentProps` | Manual via custom component | Good. The cleanest path is a custom notification component that consumes the theme. |

### 3.2 API surface, actions, queueing, and swipe

| Library | Imperative API | Action buttons | Multi-toast / queue | Swipe to dismiss | Promise toasts |
|---------|----------------|----------------|---------------------|------------------|----------------|
| **sonner-native** | `toast()` / `toast.success()` etc. | `action` and `cancel` buttons | Yes, stacked with `visibleToasts` limit | Yes, configurable direction | Yes, built-in `toast.promise` |
| **react-native-toast-message** | `Toast.show()` / `Toast.hide()` | Single `onPress` only | No — one toast at a time [[#104](https://github.com/calintamas/react-native-toast-message/issues/104)] | Optional `swipeable` | No |
| **burnt** | `Burnt.toast()` / `Burnt.alert()` | No | No | `shouldDismissByDrag` on iOS only | No |
| **react-native-flash-message** | `showMessage()` / `hideMessage()` | `onPress` only | No | No | No |
| **react-native-root-toast** | `Toast.show()` / `Toast.hide()` | `onPress` / `hideOnPress` | No | No | No |
| **react-native-notifier** | `Notifier.showNotification()` | Custom component only | Queue modes: `reset`, `standby`, `next`, `immediate` | Yes | No |

### 3.3 Accessibility and bundle size

| Library | Screen-reader support | Package size (npm unpacked) | Dependencies |
|---------|----------------------|-----------------------------|--------------|
| **sonner-native** | Built-in announcements, a11y roles/labels in roadmap [[#355](https://github.com/gunnartorfis/sonner-native/issues/355)] | ~535 KB | 6 peer deps: Reanimated, Gesture Handler, Safe Area, Screens, SVG, Worklets |
| **react-native-toast-message** | None built-in; must add `accessibilityRole`/`label` in custom layout | ~47 KB | None |
| **burnt** | Relies on native iOS/Android accessibility | ~60 KB + native deps | `sf-symbols-typescript`, `sonner` (web) |
| **react-native-flash-message** | None built-in | ~62 KB | `prop-types`, `react-native-iphone-screen-helper` |
| **react-native-root-toast** | None built-in | ~18 KB | `react-native-root-siblings` |
| **react-native-notifier** | None built-in | ~141 KB | `react-native-gesture-handler` peer |

---

## 4. Maintenance status

| Library | Open issues | Maintenance signal |
|---------|-------------|--------------------|
| **sonner-native** | 15 | Very active: published today (0.26.5), frequent releases, clear roadmap. |
| **react-native-toast-message** | 92 | Moderate: 2.4.0 published July 2026, but large issue backlog and no native queueing. |
| **burnt** | 21 | Low-moderate: last publish March 2025; Fernando Rojo's libraries are quality but updates are sporadic. |
| **react-native-flash-message** | 24 | Stale: last publish August 2023; not keeping pace with modern RN. |
| **react-native-root-toast** | 95 | Risky: listed in Expo docs but flagged as unmaintained; many open compatibility issues. |
| **react-native-notifier** | 19 | Stalled: v2 is 14 months old; v3 RC has been pending since Jan 2025. |

---

## 5. Summary comparison

| Criterion | sonner-native | react-native-toast-message | burnt | react-native-flash-message | react-native-root-toast | react-native-notifier |
|-----------|---------------|---------------------------|-------|---------------------------|------------------------|-----------------------|
| Expo Go compatible | Yes | Yes | No (dev build) | Yes | Yes | Yes |
| RN 0.86 / New Arch risk | Low | Low | Low-moderate | Low (untested) | Moderate-high | Moderate |
| Design-system theming | Excellent | Good with custom layout | Poor | Good | Moderate | Good with custom component |
| Multi-toast queue | Yes | No | No | No | No | Yes |
| Action buttons | Yes | No | No | No | Limited | Custom component only |
| Swipe to dismiss | Yes | Yes | iOS only | No | No | Yes |
| Promise/loading toasts | Yes | No | No | No | No | No |
| Accessibility | Built-in / improving | Must add manually | Native | Must add manually | Must add manually | Must add manually |
| Bundle size (lib only) | ~535 KB | ~47 KB | ~60 KB | ~62 KB | ~18 KB | ~141 KB |
| Maintenance | Very active | Moderate | Sporadic | Stale | Risky | Stalled |

---

## 6. Recommendation

**Choose `sonner-native` for Wellvio's toast feedback layer.**

**Reasoning:**

1. **Best fit for the design system.** `sonner-native` lets us map global and per-variant styles directly to Wellvio's `ThemeColors` (`success`, `error`, `warning`, backgrounds, radii, spacing) without building a full custom renderer.
2. **Modern feature set for the v0 use cases.** It supports stacked toasts, action buttons, swipe-to-dismiss, and promise/loading states out of the box. That covers likely future needs (e.g., "Food saved", "Sync failed — retry", "Creating plan…") without adding more libraries later.
3. **Compatible with Expo SDK 57 / RN 0.86.** It is JS-only (Expo Go friendly) and its peer dependencies (Reanimated 4.x, Gesture Handler 2.x, Worklets) align with the versions Expo SDK 57 validates. The library is actively maintained and has no open Expo 57 / RN 0.86 blockers.
4. **Better accessibility posture.** Screen-reader announcements and a11y props are either built in or on the near-term roadmap; the other candidates require manual wiring.

**Trade-offs:**

- **Bundle size:** `sonner-native` is the largest candidate at ~535 KB unpacked (plus Reanimated/Gesture Handler/SVG/Worklets peers). Most of those peers are already common in modern Expo apps; Wellvio already uses `react-native-safe-area-context` and `react-native-screens`, but does not currently use Reanimated, Gesture Handler, or Worklets. Adding them increases the dependency surface.
- **Dependency weight:** If the team wants to avoid Reanimated/Worklets entirely (for example, due to the Hermes V1 + Reanimated memory regression called out in the SDK 57 release notes [[React Native Weekly #35](https://rnw.kazutoyo.jp/en/posts/react-native-weekly-35/)]), `sonner-native` is the wrong choice.
- **Scope creep risk:** A rich toast library can encourage over-use. Inline field errors should remain the primary validation pattern; toasts should be reserved for confirmations and non-field errors.

**If bundle/dependency weight is the deciding factor**, the fallback is `react-native-toast-message`. It is tiny, has no peer dependencies, and is actively used in production, but it only shows one toast at a time, has no native action buttons, and requires custom layout work to match the design system.

**Suggested initial integration:**

1. Add `sonner-native` plus peers:
   ```bash
   npx expo install sonner-native react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens react-native-svg react-native-worklets
   ```
2. Mount `<Toaster />` as the last child in `mobile/App.tsx`, after `RootNavigator`.
3. Create a thin `mobile/src/lib/toast.ts` wrapper that maps `toast.success`, `toast.error`, and `toast.warning` to Wellvio theme colors and keeps the public surface small.
4. Keep `WvInput` inline errors unchanged; use toasts only for screen-level confirmations and non-field errors.

---

## Sources

- Expo SDK 57 Changelog / upgrade guide: https://docs.expo.dev/workflow/upgrading/
- Expo SDK 57 release notes: https://expo.dev/changelog/sdk-57
- Expo "Display a popup toast" docs (still recommends react-native-root-toast): https://docs.expo.dev/ui-programming/react-native-toast/
- Expo issue on outdated toast recommendation: https://github.com/expo/expo/issues/33581
- React Native Weekly #35 (SDK 57 / Reanimated memory note): https://rnw.kazutoyo.jp/en/posts/react-native-weekly-35/
- sonner-native GitHub: https://github.com/gunnartorfis/sonner-native
- sonner-native docs: https://sonner-native.netlify.app/
- sonner-native npm: https://www.npmjs.com/package/sonner-native
- React Native Directory — sonner-native: https://reactnative.directory/package/sonner-native
- react-native-toast-message GitHub: https://github.com/calintamas/react-native-toast-message
- react-native-toast-message API docs: https://github.com/calintamas/react-native-toast-message/blob/main/docs/api.md
- react-native-toast-message npm: https://www.npmjs.com/package/react-native-toast-message
- React Native Directory — react-native-toast-message: https://reactnative.directory/package/react-native-toast-message
- burnt GitHub: https://github.com/nandorojo/burnt
- burnt npm: https://www.npmjs.com/package/burnt
- React Native Directory — burnt: https://reactnative.directory/package/burnt
- react-native-flash-message GitHub: https://github.com/lucasferreira/react-native-flash-message
- react-native-flash-message npm: https://www.npmjs.com/package/react-native-flash-message
- React Native Directory — react-native-flash-message: https://reactnative.directory/package/react-native-flash-message
- react-native-root-toast GitHub: https://github.com/magicismight/react-native-root-toast
- react-native-root-toast npm: https://www.npmjs.com/package/react-native-root-toast
- React Native Directory — react-native-root-toast: https://reactnative.directory/package/react-native-root-toast
- react-native-notifier GitHub: https://github.com/seniv/react-native-notifier
- react-native-notifier npm: https://www.npmjs.com/package/react-native-notifier
- React Native Directory — react-native-notifier: https://reactnative.directory/package/react-native-notifier
