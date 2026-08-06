# Research: Supabase Auth profile identity fields

> Wayfinder ticket #41 — "Supabase Auth API for profile identity fields"
>
> Mobile app context: React Native/Expo, `@supabase/supabase-js` `^2.112.0` (resolved to `@supabase/auth-js` `2.112.0`). Files: `mobile/src/lib/supabase.ts`, `mobile/src/contexts/AuthContext.tsx`.

## TL;DR

- The current user is read with `supabase.auth.getUser()`; the returned `User` exposes `email`, `user_metadata` (e.g. `display_name`), and `created_at`.
- `supabase.auth.updateUser({ data: { display_name: '...' } })` merges the supplied metadata into `auth.users.raw_user_meta_data` and emits a `USER_UPDATED` event.
- `supabase.auth.updateUser({ email: 'new@example.com' })` starts an email-change confirmation flow. By default (Secure email change ON) confirmation links/OTPs are sent to **both** the old and new addresses; the change only commits after both are confirmed.

## Reading profile identity fields

### Client method

```ts
const { data: { user }, error } = await supabase.auth.getUser()
```

- `getUser()` calls `GET /auth/v1/user` using the current access token and returns a server-verified `User` object (`GoTrueClient.js:2659-2716`).
- It is the recommended way to get trusted user data. `supabase.auth.getSession()` also exposes `session.user`, but the docs warn that the user object from session storage should not be trusted in insecure storage scenarios ([Supabase Docs: User object](https://supabase.com/docs/guides/auth/users)).

### Relevant `User` fields

From the installed SDK types (`types.d.ts:387-414`):

| Field | Type | Meaning |
|-------|------|---------|
| `email` | `string \| undefined` | Current email address. |
| `user_metadata` | `object` | Custom metadata, stored in `auth.users.raw_user_meta_data`. For this app, `display_name` is written here at sign-up via `options.data.display_name`. |
| `created_at` | `string` | ISO-8601 timestamp of account creation. |
| `new_email` | `string \| undefined` | Pending email address after an email change is requested. |
| `email_change_sent_at` | `string \| undefined` | When the email-change confirmation was sent. |

Example usage for the Profile screen:

```ts
const displayName = user.user_metadata?.display_name ?? ''
const email = user.email ?? ''
const memberSince = user.created_at // parse as ISO date
```

## Updating the display name (user metadata)

### Client method

```ts
const { data: { user }, error } = await supabase.auth.updateUser({
  data: { display_name: 'New Name' },
})
```

- `updateUser()` calls `PUT /auth/v1/user` with the current access token (`GoTrueClient.js:2831-2872`).
- The `data` field maps to the `auth.users.raw_user_meta_data` column (`types.d.ts:443-448`, [Supabase Docs: Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)).

### Merge behavior

The server merges the `data` object at the top level rather than replacing the whole metadata object. New keys are added, existing keys are overwritten, and keys set to `null` are removed ([`supabase/auth/internal/models/user.go:230-243`](https://github.com/supabase/auth/blob/master/internal/models/user.go#L230-L243)):

```go
for key, value := range updates {
    if value != nil {
        u.UserMetaData[key] = value
    } else {
        delete(u.UserMetaData, key)
    }
}
```

To update only `display_name` without clobbering other metadata, pass just that key.

### Auth events / session

On success, the SDK:

1. Updates `session.user` with the returned user object.
2. Persists the updated session via `_saveSession`.
3. Emits `'USER_UPDATED'` to all `onAuthStateChange` subscribers (`GoTrueClient.js:2869-2871`, [Supabase Docs: onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)).

The existing `AuthContext.tsx` already listens via `supabase.auth.onAuthStateChange`, so the UI will re-render automatically when metadata changes.

### Permissions / security

- No special role is required; the user only needs an active session.
- `user_metadata` is editable by the signed-in user, so it must **not** be used for authorization (e.g. RLS policies or role checks). Use `app_metadata` (server-only / service-role) for claims that drive permissions ([Supabase Docs: Managing user data](https://supabase.com/docs/guides/auth/managing-user-data), [Supabase Docs: Users](https://supabase.com/docs/guides/auth/users)).

## Updating the email address

### Client method

```ts
const { data: { user }, error } = await supabase.auth.updateUser({
  email: 'new@example.com',
})
```

The method accepts an optional `options.emailRedirectTo` for link-based confirmation flows (`GoTrueClient.d.ts:1707-1709`).

### Confirmation flow

- By default, **Secure email change** is enabled. In that mode, Supabase sends a confirmation to the **new** email and a separate confirmation to the **current** email; the change is only applied after both are confirmed ([Supabase Docs: Update a user](https://supabase.com/docs/reference/javascript/auth-update), `GoTrueClient.js:2722-2728`).
- To only require confirmation from the new email, disable **Secure email change** in the project's Email provider settings.
- The server sets `new_email` and sends the verification; the existing session remains valid and `user.email` does not change until confirmation completes ([`supabase/auth/internal/api/user.go:251-277`](https://github.com/supabase/auth/blob/master/internal/api/user.go#L251-L277)).

### Completing the change

Users can confirm via:

1. Clicking the link in the email (deep-link handling in the mobile app).
2. Entering the OTP with `supabase.auth.verifyOtp({ type: 'email_change', email: 'new@example.com', token: '123456' })`.

After verification, the updated user/session is returned; if using PKCE, the SDK includes a `code_challenge` when requesting the email change (`GoTrueClient.js:2855-2857`).

## Edge cases and implementation notes

1. **Email change requires confirmation by default.** Do not treat a successful `updateUser({ email })` response as a committed email change; inspect `user.new_email` and wait for confirmation.
2. **Metadata merge, not replace.** Only the top-level keys provided in `data` are changed. To remove a key, set it to `null`.
3. **JWT claims may lag.** `updateUser` updates the persisted user object but does not issue a new access token. If `user_metadata` is used inside JWT claims for RLS, call `supabase.auth.refreshSession()` (or wait for the next auto-refresh) to obtain a token with the new claims.
4. **Server vs. client source of truth.** `getUser()` fetches from the Auth server and is trustworthy. `session.user` is a local copy that can be stale until `USER_UPDATED` or `TOKEN_REFRESHED` fires.
5. **RLS / authorization.** Because `user_metadata` is client-writable, never store roles or permissions there. Keep authorization data in `app_metadata` and update it server-side with the service role / Admin API.

## Sources

- Supabase Docs: [Users](https://supabase.com/docs/guides/auth/users)
- Supabase Docs: [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data)
- Supabase Docs: [JavaScript `updateUser`](https://supabase.com/docs/reference/javascript/auth-updateuser)
- Supabase Docs: [JavaScript `getUser`](https://supabase.com/docs/reference/javascript/auth-getuser)
- Supabase Docs: [JavaScript `onAuthStateChange`](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- Installed SDK types: `mobile/node_modules/@supabase/auth-js/dist/main/lib/types.d.ts`
- Installed SDK implementation: `mobile/node_modules/@supabase/auth-js/dist/main/GoTrueClient.js`
- Server-side merge logic: [`supabase/auth/internal/models/user.go#L230-L243`](https://github.com/supabase/auth/blob/master/internal/models/user.go#L230-L243)
- Server-side email-change logic: [`supabase/auth/internal/api/user.go#L251-L277`](https://github.com/supabase/auth/blob/master/internal/api/user.go#L251-L277)
