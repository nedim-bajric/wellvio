# Backend Stack Comparison: NestJS vs. .NET for Wellvio

**Project context:** A single-user React Native mobile app that syncs Garmin health/activity data and diet logs to an AWS backend. The comparison is framed for a solo developer who needs to ship and maintain the backend with minimal overhead.

**Evaluation date:** July 2026

---

## 1. Ecosystem fit for the domain

### Data sync patterns

Wellvio’s core workload is two-fold: (1) ingesting pushed/periodic data from Garmin, and (2) syncing diet logs entered on the mobile app. Both are I/O-bound, event-driven flows that map well to REST webhooks, scheduled jobs, and queued background processing.

| Aspect | NestJS | .NET |
|--------|--------|------|
| Language & runtime | TypeScript / Node.js | C# / .NET |
| Concurrency model | Single-threaded event loop, async/await for I/O | Multi-threaded async/await with thread pool |
| Framework style | Opinionated, Angular-inspired modules, DI, decorators | Mature MVC / minimal APIs, DI built into `Microsoft.Extensions` |
| Built-in scheduling | `@nestjs/schedule` (cron, intervals, timeouts) [[NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)] | `IHostedService` / `BackgroundService` with `System.Threading.Timer` or `PeriodicTimer` [[ASP.NET Core Hosted Services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-9.0)] |
| Background queues | First-class `@nestjs/bullmq` / `@nestjs/bull` wrappers around Redis-backed BullMQ/Bull [[NestJS Queues](https://docs.nestjs.com/techniques/queues)] | In-memory `Channel<T>` queues or external services (Azure Service Bus, RabbitMQ, Hangfire, Quartz.NET) |
| Webhook/API design | Controllers + DTOs + OpenAPI via `@nestjs/swagger` | Controller-based or minimal APIs; built-in OpenAPI in .NET 9 [[ASP.NET Core Web API](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger?view=aspnetcore-10.0)] |

**Verdict for this domain:** Both stacks handle the workload. NestJS’s queue and scheduling packages are more "batteries-included" for Redis-based job processing, which is useful for buffering Garmin push events and retrying diet-log uploads. .NET is more performant under CPU load but requires picking and wiring a job scheduler.

### API design for React Native

React Native uses the standard `fetch` API and `XMLHttpRequest` for HTTP calls [[React Native Networking](https://reactnative.dev/docs/network)]. Both backends can expose JSON-over-HTTP endpoints identically. A TypeScript backend lets the solo developer share request/response types, validation schemas, and utilities between the mobile app and the API, reducing translation bugs.

---

## 2. AWS deployment and hosting cost/complexity

Both stacks deploy to AWS via the same compute services. The main difference is runtime packaging size, cold-start behavior, and tooling familiarity.

| Service | Cost model (primary sources) | NestJS fit | .NET fit |
|---------|------------------------------|------------|----------|
| **AWS Lambda** | Per-request + duration (GB-seconds). Free tier: 1M requests and 400,000 GB-seconds/month [[AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)] | Native Node.js runtime (`nodejs22.x`, `nodejs24.x`) [[Lambda Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)]; small deployment packages; fast cold starts for I/O workloads | Managed `dotnet8` runtime (container-only for .NET 9); larger deployment packages; slower cold start than Node.js unless trimmed/AOT |
| **Amazon ECS / Fargate** | Per vCPU, memory, storage, and OS, billed per second with 1-minute minimum [[AWS Fargate Pricing](https://aws.amazon.com/fargate/pricing/)] | Docker container; runs full NestJS app + worker in same task or separate services | Docker container; natural fit for long-running ASP.NET Core app + Worker Service sidecar |
| **AWS App Runner** | Provisioned memory per GB-hour + active vCPU per vCPU-hour; no free tier [[AWS App Runner Pricing](https://aws.amazon.com/apprunner/pricing/)] | Very low friction for a stateless NestJS API; source or ECR deploy | Supported, but .NET build images are larger; cost is comparable |
| **AWS Elastic Beanstalk** | No service fee; pay for underlying EC2/ELB resources [[AWS Elastic Beanstalk Pricing](https://aws.amazon.com/elasticbeanstalk/pricing/)] | Supported platform (Node.js) | Supported platform (.NET on Windows or Linux) |
| **Amazon EC2** | Per-second billing, minimum 60s; free tier `t2.micro`/`t3.micro` for 12 months [[AWS EC2 Pricing](https://aws.amazon.com/ec2/pricing/)] [[AWS Free Tier](https://aws.amazon.com/free/)] | Cheap single-instance option for dev/staging | Same; Windows licensing adds cost if not using Linux |

### Cost estimate for a single-user prototype

For a prototype with low traffic:

- **Lambda (NestJS, 512 MB, ~100 ms avg):** Likely within the free tier if under ~1M invocations and ~400k GB-seconds/month. Additional compute is ~$0.0000166667/GB-s + $0.20/M requests.
- **App Runner (1 vCPU / 2 GB, paused 22h/day):** ~$4.80/month per AWS’s example [[AWS App Runner Pricing](https://aws.amazon.com/apprunner/pricing/)]. Always-on pushes this toward ~$25–30/month.
- **Fargate (0.25 vCPU / 0.5 GB, always-on):** ~$8–10/month + ALB if public (~$16–22/month).
- **Elastic Beanstalk on EC2 free tier:** $0 for 12 months if a `t2.micro`/`t3.micro` is sufficient.

**Verdict for cost/complexity:** NestJS on Lambda or App Runner is the cheapest and simplest path for a prototype. .NET is perfectly deployable to ECS/Fargate or Elastic Beanstalk but tends to have larger containers and slightly higher cold-start costs in Lambda.

---

## 3. Developer experience and maintenance burden for a solo project

| Factor | NestJS | .NET |
|--------|--------|------|
| Language overlap with React Native | TypeScript — high overlap; shared types and validation | C# — separate language and ecosystem |
| Learning curve for a JS/TS developer | Low if familiar with Angular-style decorators and Node.js | Moderate; different tooling (`dotnet` CLI, MSBuild, NuGet) |
| Package ecosystem | npm — huge, but quality varies; `@nestjs/*` official packages are stable [[@nestjs/core](https://www.npmjs.com/package/@nestjs/core)] [[@nestjs/schedule](https://www.npmjs.com/package/@nestjs/schedule)] [[@nestjs/bullmq](https://www.npmjs.com/package/@nestjs/bullmq)] | NuGet — mature, enterprise-grade; `Microsoft.AspNetCore.App` shared framework covers most web needs [[Microsoft.AspNetCore.App](https://www.nuget.org/packages/Microsoft.AspNetCore.App/)] |
| Tooling & debugging | Node.js debugger, VS Code, Jest; fast iterative startup | Rider/VS + `dotnet watch`; excellent profiler and diagnostics |
| Long-term maintenance | Frequent Node.js runtime updates; dependency churn | Slower, predictable LTS cadence; strong backward compatibility |
| Runtime LTS on AWS | `nodejs22.x` supported until Apr 2027; `nodejs24.x` until Apr 2028 [[Lambda Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)] | `dotnet8` until Nov 2026; `dotnet10` until Nov 2028 |

**Verdict for a solo project:** NestJS reduces context switching because the frontend and backend share TypeScript, JSON tooling, and npm workflows. .NET is more robust long-term but introduces a second language and toolchain that a solo developer must maintain alone.

---

## 4. Offline-to-online sync support patterns

Offline support is primarily a mobile-app concern, but the backend must accept batched, out-of-order, idempotent updates.

| Pattern | NestJS implementation | .NET implementation |
|---------|----------------------|---------------------|
| **Client-side queue** | React Native stores pending diet logs locally (e.g., AsyncStorage, WatermelonDB, Realm) and POSTs them when online | Same; language-independent |
| **Idempotent upload endpoint** | NestJS controller receives a batch with client-generated UUIDs + `lastModifiedAt`; upserts into DB | ASP.NET Core minimal API or controller with the same upsert logic |
| **Conflict resolution** | Server-side "last-write-wins" or version-vector merge in a service | Same |
| **Background reconciliation** | `@nestjs/schedule` cron or BullMQ delayed jobs retry failed Garmin fetches | `IHostedService` or Hangfire/Quartz.NET |
| **Push events (Garmin)** | Webhook handler enqueues BullMQ job for durable, retryable processing | Webhook handler enqueues channel/queue job |

Neither framework provides offline sync out of the box; both support the required patterns. NestJS’s BullMQ integration makes durable, retryable background processing marginally faster to wire up.

---

## 5. Garmin SDK/client library availability

Garmin’s official developer program offers the **Garmin Connect Developer Program**, which includes Health API, Activity API, Women’s Health API, Training API, and Courses API. Partner approval and OAuth are required for the official cloud APIs [[Garmin Connect Developer Program](https://developerportal.garmin.com/developer-programs/connect-developer-api)]. Garmin also provides the **Connect IQ SDK** for wearable apps and companion mobile SDKs for Android/iOS [[Garmin Developer Portal](https://developerportal.garmin.com/developer-programs/connect-developer-api)].

For a backend that consumes user-authorized Garmin data, the practical options are:

| Option | Node.js / NestJS | .NET |
|--------|------------------|------|
| **Official server-side SDK** | None identified for the Health API | None identified for the Health API |
| **Community client libraries** | `garmin-connect` / `@gooin/garmin-connect` on npm — actively maintained, OAuth2 session reuse, activity/workout/health methods, custom requests [[@gooin/garmin-connect](https://www.npmjs.com/package/@gooin/garmin-connect)] | `Unofficial.Garmin.Connect` and `YetAnotherGarminConnectClient` on NuGet — much smaller download counts, unofficial, personal-use warnings [[Unofficial.Garmin.Connect](https://www.nuget.org/packages/Unofficial.Garmin.Connect)] [[YetAnotherGarminConnectClient](https://www.nuget.org/packages/YetAnotherGarminConnectClient)] |
| **OAuth handling** | OAuth 1.0a signing libraries widely available for Node.js | OAuth libraries available, but fewer Garmin-specific examples |

**Important caveats:** The community libraries connect to Garmin Connect consumer endpoints, not the official Health API, and Garmin’s terms require partner approval for production use. For Wellvio’s initial single-user scope, the Node.js `garmin-connect` ecosystem is more mature and better documented, reducing integration risk.

**Verdict for Garmin integration:** NestJS/Node.js has a clear advantage in community library maturity and examples. .NET would likely require building a custom OAuth 1.0a client against Garmin’s REST endpoints.

---

## 6. Summary comparison

| Criterion | NestJS | .NET | Lean |
|-----------|--------|------|------|
| Fit for I/O-bound sync / webhooks | Excellent | Excellent | — |
| Scheduled jobs & queues | Excellent (official packages) | Good (requires extra choices) | NestJS |
| React Native type sharing | Excellent (TypeScript) | Poor (separate language) | NestJS |
| AWS Lambda cold start / cost | Excellent | Good | NestJS |
| Deployment simplicity on AWS | Excellent (Lambda, App Runner, ECS) | Good (ECS, Beanstalk, Lambda container) | NestJS |
| Garmin library ecosystem | Good (mature npm libraries) | Weak (unofficial, low-usage NuGet) | NestJS |
| Long-term robustness / performance | Good | Excellent | .NET |
| Maintenance for a solo dev | Lower cognitive load | Higher cognitive load | NestJS |

---

## 7. Recommendation

**Choose NestJS (TypeScript / Node.js) for the Wellvio backend.**

**Reasoning:**

1. **Single-developer velocity:** TypeScript is shared with the React Native frontend, enabling shared DTOs, validation logic, and faster context switching.
2. **AWS cost and simplicity for low traffic:** NestJS runs natively on AWS Lambda within the generous free tier and deploys trivially to App Runner or ECS Fargate as the app grows.
3. **Domain patterns are built-in:** `@nestjs/schedule` and `@nestjs/bullmq` give cron jobs and durable background queues with minimal wiring—ideal for ingesting Garmin data and retrying diet-log uploads.
4. **Garmin integration is easier:** The Node.js `garmin-connect` ecosystem is more mature and better documented than the sparse .NET alternatives.

**.NET is a defensible alternative if** the workload later grows into heavy CPU processing, strict enterprise requirements, or a multi-developer team where C# expertise is already present. For the current single-user, mobile-sync use case, those benefits do not outweigh the added friction.

**Suggested initial target architecture:** NestJS on **AWS Lambda** (API Gateway + Function URL) for the API, with **BullMQ on Amazon ElastiCache (Redis)** or **Amazon SQS** for background Garmin ingestion, and **Amazon DynamoDB or PostgreSQL (RDS)** for data storage. This can migrate to ECS/Fargate if always-on requirements or traffic grow.

---

## Sources

- NestJS documentation: https://docs.nestjs.com/
- NestJS Task Scheduling: https://docs.nestjs.com/techniques/task-scheduling
- NestJS Queues (BullMQ/Bull): https://docs.nestjs.com/techniques/queues
- npm `@nestjs/core`: https://www.npmjs.com/package/@nestjs/core
- npm `@nestjs/schedule`: https://www.npmjs.com/package/@nestjs/schedule
- npm `@nestjs/bullmq`: https://www.npmjs.com/package/@nestjs/bullmq
- ASP.NET Core documentation: https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-9.0
- ASP.NET Core Web API / Swagger: https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger?view=aspnetcore-10.0
- ASP.NET Core Hosted Services: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-9.0
- NuGet `Microsoft.AspNetCore.App`: https://www.nuget.org/packages/Microsoft.AspNetCore.App/
- AWS Lambda Pricing: https://aws.amazon.com/lambda/pricing/
- AWS Lambda Runtimes: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
- AWS Fargate Pricing: https://aws.amazon.com/fargate/pricing/
- AWS App Runner Pricing: https://aws.amazon.com/apprunner/pricing/
- AWS Elastic Beanstalk Pricing: https://aws.amazon.com/elasticbeanstalk/pricing/
- Amazon EC2 Pricing: https://aws.amazon.com/ec2/pricing/
- AWS Free Tier: https://aws.amazon.com/free/
- Garmin Connect Developer Program: https://developerportal.garmin.com/developer-programs/connect-developer-api
- npm `@gooin/garmin-connect`: https://www.npmjs.com/package/@gooin/garmin-connect
- NuGet `Unofficial.Garmin.Connect`: https://www.nuget.org/packages/Unofficial.Garmin.Connect
- NuGet `YetAnotherGarminConnectClient`: https://www.nuget.org/packages/YetAnotherGarminConnectClient
- React Native Networking: https://reactnative.dev/docs/network
