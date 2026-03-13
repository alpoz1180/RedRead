# Push Notifications — Setup Guide

This guide walks you through every step required to enable browser Web Push
notifications in the redread-next project.

---

## Prerequisites

- Supabase CLI installed (`npm i -g supabase`)
- Logged in to Supabase CLI: `supabase login`
- Project linked: `supabase link --project-ref epwyfcwagumvcyvtoylx`

---

## Step 1 — Generate VAPID keys

VAPID (Voluntary Application Server Identification) keys authenticate your
server to push services (Chrome/Firefox/Safari).

```bash
npx web-push generate-vapid-keys
```

You will see output like:

```
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjZkME5O1VoxFOPPeO

Private Key:
o4yEjLF7YCoBKJgbBJTFM0FJZ1l5mBEXM4ym1mYQNYk
```

Keep the private key secret. You will use both values in the following steps.

---

## Step 2 — Add the public key to your Next.js environment

In `.env.local` (and in your production environment variables):

```
NEXT_PUBLIC_VAPID_KEY=<your-public-key-here>
```

This value is used by the browser-side service worker when calling
`pushManager.subscribe({ applicationServerKey: ... })`.

---

## Step 3 — Add VAPID secrets to Supabase

```bash
supabase secrets set VAPID_PUBLIC_KEY=<your-public-key-here>
supabase secrets set VAPID_PRIVATE_KEY=<your-private-key-here>
```

These are read inside the `send-push` Edge Function via `Deno.env.get(...)`.

> Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically
> by Supabase into every Edge Function — you do not need to set them manually.

---

## Step 4 — Run the SQL migration

Open the Supabase Dashboard → SQL Editor, paste the contents of:

```
supabase/migrations/20260313000001_push_subscriptions.sql
```

and click **Run**.

This creates the `public.push_subscriptions` table with RLS policies so:
- Authenticated users can insert / delete / read their own subscriptions.
- The service role (Edge Functions) can read all subscriptions.

Alternatively, if you use the CLI:

```bash
supabase db push
```

---

## Step 5 — Deploy the Edge Function

```bash
supabase functions deploy send-push
```

The function will be available at:

```
https://epwyfcwagumvcyvtoylx.supabase.co/functions/v1/send-push
```

To test it manually:

```bash
curl -X POST \
  https://epwyfcwagumvcyvtoylx.supabase.co/functions/v1/send-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -d '{"userId":"<uuid>","title":"Hello","body":"Test notification","url":"/stories"}'
```

---

## Step 6 — Set up Database Webhooks for likes and follows

Supabase Database Webhooks fire an HTTP POST to a URL whenever a row is
inserted, updated, or deleted.

### 6a. Like notification webhook

1. Go to **Supabase Dashboard → Database → Webhooks → Create a new hook**.
2. Name: `notify-on-like`
3. Table: `public.likes`
4. Events: `INSERT`
5. HTTP method: `POST`
6. URL:
   ```
   https://epwyfcwagumvcyvtoylx.supabase.co/functions/v1/send-push
   ```
7. HTTP Headers:
   ```
   Content-Type: application/json
   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
   ```
8. HTTP Body template (Supabase passes `record` as the new row):
   > Supabase webhooks POST a JSON body that contains `{ type, table, record, ... }`.
   > You need a small wrapper — either a second Edge Function or a Postgres function
   > that reads `record.author_id` (the story author) and calls `send-push`.

   **Recommended approach:** Create a separate `on-like` Edge Function that
   receives the webhook payload, looks up the story author, and calls `send-push`
   internally:

   ```ts
   // supabase/functions/on-like/index.ts (sketch)
   Deno.serve(async (req) => {
     const { record } = await req.json();
     // record.story_id → look up author_id
     // POST to send-push with { userId: authorId, title: "New like", body: "..." }
   });
   ```

### 6b. Follow notification webhook

Same steps as above but:
- Table: `public.follows` (or `public.followers`, depending on your schema)
- Events: `INSERT`
- The webhook handler reads `record.following_id` (the person being followed)
  and sends a push to that user.

---

## Browser-side integration (summary)

In your Next.js client code you will need to:

1. Register a service worker (`/public/sw.js`) that listens for `push` events:

   ```js
   self.addEventListener('push', (event) => {
     const { title, body, url } = event.data.json();
     event.waitUntil(
       self.registration.showNotification(title, {
         body,
         data: { url },
       })
     );
   });

   self.addEventListener('notificationclick', (event) => {
     event.notification.close();
     event.waitUntil(clients.openWindow(event.notification.data.url));
   });
   ```

2. After the user grants notification permission, subscribe to push:

   ```ts
   const registration = await navigator.serviceWorker.ready;
   const subscription = await registration.pushManager.subscribe({
     userVisibleOnly: true,
     applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
   });
   ```

3. Save the subscription object to Supabase:

   ```ts
   await supabase.from('push_subscriptions').insert({
     user_id: session.user.id,
     subscription: subscription.toJSON(),
   });
   ```

---

## Security notes

- Never expose `VAPID_PRIVATE_KEY` on the client side.
- The `send-push` Edge Function should only be called from other Edge Functions
  or server-side code using the service role key — not directly from the browser.
- Stale subscriptions (HTTP 404 / 410 responses from push services) are
  automatically deleted by the `send-push` function.
