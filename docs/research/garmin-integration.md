# Garmin Integration Options for Wellvio

Research ticket: [#2](https://github.com/nedim-bajric/wellvio/issues/2)  
Map: [#1](https://github.com/nedim-bajric/wellvio/issues/1)

Goal: identify realistic, automatic ways to pull health and activity data from Garmin into a React Native mobile app without manual file import/export.

---

## TL;DR

- The official **Garmin Health API / Activity API** are enterprise-only. They are not freely available for personal-use apps, require a business application, and are designed for cloud-to-cloud integrations.
- The APIs expose rich daily/epoch/activity/sleep data, but sync is push/ping-based and only occurs when the user syncs their Garmin device to Garmin Connect.
- For a single-user MVP, the lower-friction path is the **Connect IQ Companion SDK** (free): build a tiny Monkey C watch app that forwards data to a React Native app via the native iOS/Android companion SDKs. A community React Native wrapper exists but is thin.
- Unofficial Garmin Connect "scraping" libraries are easy to prototype with but fragile and violate Garmin’s terms of service; not suitable for production.

---

## 1. Official Garmin Health API / Activity API

### 1.1 Availability and pricing

The Garmin Health API and Activity API are part of the **Garmin Connect Developer Program**, which Garmin explicitly says is **"available for enterprise use"** and **"only for business use"** [[Program FAQ](https://developer.garmin.com/gc-developer-program/program-faq/)].

Key points from Garmin:

- There are **no licensing or maintenance fees** for access to the Developer Program.
- Some metrics require a **license fee payment or minimum device order quantity** for commercial use. The Health API feature page marks **"Enhanced Beat-To-Beat Interval"** with an asterisk noting "Commercial use requires a license fee payment" [[Health API](https://developer.garmin.com/gc-developer-program/health-api/)].
- **Activity Details** summaries are a premium summary type and are not enabled by default; access requires contacting Garmin Health API support [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)].
- The integration process: apply for the program, get a response within two business days, then access the Developer Portal and evaluation environment [[Program FAQ](https://developer.garmin.com/gc-developer-program/program-faq/)].

Implication for wellvio: as a single-user MVP, getting approved may be difficult unless the project is framed as a business offering. Personal-use access is not supported.

### 1.2 Data fields and granularity

The Health API exposes summary data in JSON format [[Health API](https://developer.garmin.com/gc-developer-program/health-api/)]. Summary types include [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)]:

| Summary type | Granularity / contents |
| --- | --- |
| **Dailies** | One record per day: steps, distance, calories (BMR, active, consumed), floors climbed, heart rate min/avg/max/resting, stress avg/max/duration by zone, goals, intensity minutes. |
| **Epochs** | 15-minute buckets of steps, distance, active calories, MET, intensity, motion intensity. |
| **Activities (summary)** | High-level info per timed activity (type, duration, calories, avg HR, etc.). |
| **Activity Details** | Detailed per-activity data including GPS coordinates and sensor data; **premium**. |
| **Activity Files** | Original `.FIT`, `.GPX`, `.TCX` files. |
| **Sleep** | Sleep duration + light/deep/REM/awake stages. |
| **Body Composition** | Weight, BMI, muscle mass, etc. |
| **Stress Details** | Averaged stress scores with 3-minute granularity. |
| **User Metrics** | VO2 max, fitness age, etc. |
| **Move IQ Events** | Auto-detected activities. |
| **Pulse Ox** | SpO2 readings. |
| **Respiration** | Respiration rate. |

Daily summaries also include `timeOffsetHeartRateSamples`: a map of offset-in-seconds → HR value, where each entry is a representative sample of the previous 15 seconds [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)].

The Activity API specifically provides **FIT files** with full activity detail [[Activity API](https://developer.garmin.com/gc-developer-program/activity-api/)].

### 1.3 Authentication flow

Garmin states that all Developer Program APIs use **OAuth 2.0** [[Program FAQ](https://developer.garmin.com/gc-developer-program/program-faq/)]. However, older Health API documentation describes a **3-legged OAuth 1.0a** flow with consumer key/secret and user access token (UAT) signing [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)]. A 2025 GitHub issue from Garmin partner services notes that Garmin is transitioning Health/Activity/Women’s Health APIs from OAuth 1 to OAuth 2, with OAuth 1 retired on 2026-12-31 [[Garmin Partner Services Migration Notice](https://github.com/stoufa06/php-garmin-connect-api/issues/23)].

Flow (current OAuth 2 per Garmin FAQ):

1. Partner registers an app in the Garmin Developer Portal to obtain client credentials.
2. User grants consent via Garmin’s authorization page.
3. App receives an access token for that user.
4. App uses the token to call Health/Activity endpoints or receive push notifications.

The consumer secret must never be embedded in consumer products like mobile apps [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)], which reinforces the cloud-to-cloud design.

### 1.4 Rate limits and sync constraints

- **Evaluation keys are rate-limited**; production keys are not rate-limited after the integration passes verification [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)].
- Ping/Push notifications expect an HTTP 200 response within **30 seconds**; otherwise Garmin retries with exponential backoff [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)].
- Summary data endpoints have a **maximum query range of 24 hours by upload time** (i.e., when the user synced the data, not when the data was recorded) [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)].
- Data is **removed from the Health API 7 days after upload** (or when consent is revoked); partners must archive it themselves. Historic data can be reloaded via the Backfill service [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)].
- Sync is **not truly real-time**: data becomes available only after the user syncs their device with Garmin Connect. A forum post notes cloud sync can be delayed by hours [[Garmin Forums – Companion SDK / Health API](https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-andriod/353473/companion-sdk-health-api-and-live-heart-rate-data)].
- Push/Ping can be put "On Hold" for up to 7 days for planned maintenance [[Health REST API Specification](https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html)].

---

## 2. Lower-friction / free alternatives

### 2.1 Connect IQ Companion SDK (recommended for MVP)

Garmin offers the **Connect IQ Mobile SDK** (free) for building companion iOS/Android apps that communicate with Monkey C apps running on Garmin wearables [[Connect IQ iOS Companion SDK](https://github.com/garmin/connectiq-companion-app-sdk-ios)] [[Connect IQ Android SDK](https://github.com/garmin/connectiq-android-sdk)].

How it works:

1. Build a small Monkey C app/widget/data field on the Garmin device.
2. Use `comm.transmit` or similar APIs to send data to the paired phone.
3. Build native iOS/Android companion apps using Garmin’s SDK.
4. Bridge the native SDK into React Native via a TurboModule/NativeModule.

Data available depends on what the watch app reads from sensors or the Connect IQ APIs (e.g., `SensorHistory`, `ActivityMonitor`, `Sensor`) [[Connect IQ API Docs](https://developer.garmin.com/connect-iq/api-docs/)].

Trade-offs:

- **Pros**: no enterprise approval, no server required, near-real-time BLE communication, free SDK.
- **Cons**: requires writing a watch app in Monkey C, only works while the phone and watch are paired, data set is limited to what the watch app can access, and user must install the custom watch app.

Community example: `ios-connect-iq-comms` demonstrates two-way messaging between an iOS companion app and a Connect IQ app [[ios-connect-iq-comms](https://github.com/MatyasKriz/ios-connect-iq-comms)].

### 2.2 React Native wrapper

`react-native-garmin-connect` is a community package that wraps the native Connect IQ Companion SDK for React Native [[react-native-garmin-connect](https://github.com/malgorzatamaz/react-native-garmin-connect)]. It supports:

- SDK initialization with a custom URL scheme for iOS.
- Listing paired Garmin devices.
- Connecting to a device.
- Receiving messages from the watch (`onMessage`) and sending messages (`sendMessage`, noted as not tested by the author).
- New Architecture support for both platforms.

This is the closest to a ready-made React Native path, but it is thin and community-maintained. It still requires a custom Connect IQ watch app to send data.

### 2.3 Garmin Health SDKs (Standard / Companion)

For enterprise partners, Garmin offers **Health SDKs** (Standard and Companion) that provide direct mobile access to Garmin wearables without web service integration [[Garmin Health SDKs](https://developer.garmin.com/health-sdk/)].

- **Standard SDK**: single-app experience, no Garmin Connect required, HIPAA-compliant, full all-day + real-time sensor data.
- **Companion SDK**: works alongside Garmin Connect, real-time sensor streams + all-day data via the Health API.

Both require arranging evaluation licenses through Garmin Health and are therefore not free/self-serve.

### 2.4 Unofficial / scraping libraries

Libraries such as `python-garminconnect` and various Node.js/C# clients authenticate as a browser user and scrape Garmin Connect session data. These are **unofficial**, undocumented, can break at any time, and may violate Garmin’s terms of service [[ClawdBot Garmin API Reference](https://github.com/eversonl/ClawdBot-garmin-health-analysis/blob/main/references/api.md)]. They are useful for personal prototypes but **not recommended for production**.

### 2.5 Third-party aggregation services

Services such as **Open Wearables**, **Vital**, **Sahha**, and **Junction** offer normalized APIs over Garmin (and other sources). They handle OAuth, push notifications, and data normalization, but they are paid platforms aimed at businesses [[Open Wearables](https://openwearables.io/integrations/garmin)] [[Sahha](https://sahha.ai/integrations/oura/)] [[Junction](https://docs.junction.com/api-reference/link/bulk-trigger-historical-pull)]. They shift the integration burden but add cost and external dependency.

---

## 3. Recommendations for Wellvio

1. **For the v0 MVP**, the most realistic no-approval path is the **Connect IQ Companion SDK** + a small React Native bridge. This avoids the enterprise-only Health API gate and provides automatic, near-real-time data from the watch to the phone.
2. If the MVP later needs full historical Garmin Connect data (sleep stages, body battery, detailed activities, etc.), apply for the **Garmin Connect Developer Program** as a business, build a small backend to receive Push/Ping notifications, and expose the data to the React Native app.
3. Avoid unofficial scraping libraries for anything beyond a throwaway prototype.

---

## Sources

- Garmin Connect Developer Program overview: https://developer.garmin.com/gc-developer-program/
- Health API features and data types: https://developer.garmin.com/gc-developer-program/health-api/
- Activity API features: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Connect Developer Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Health REST API Specification v2.9.6 (primary Garmin document): https://pdfcoffee.com/healthrestapispecification296worldwide-pdf-free.html
- Garmin Health SDKs overview: https://developer.garmin.com/health-sdk/
- Connect IQ API documentation: https://developer.garmin.com/connect-iq/api-docs/
- Connect IQ iOS Companion SDK: https://github.com/garmin/connectiq-companion-app-sdk-ios
- Connect IQ Android SDK: https://github.com/garmin/connectiq-android-sdk
- react-native-garmin-connect community wrapper: https://github.com/malgorzatamaz/react-native-garmin-connect
- Garmin OAuth 1 → OAuth 2 migration notice: https://github.com/stoufa06/php-garmin-connect-api/issues/23
- Garmin Forums – Companion SDK / Health API live HR discussion: https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-andriod/353473/companion-sdk-health-api-and-live-heart-rate-data
- iOS Connect IQ two-way communication example: https://github.com/MatyasKriz/ios-connect-iq-comms
