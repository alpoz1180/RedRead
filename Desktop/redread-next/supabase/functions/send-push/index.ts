/**
 * send-push — Supabase Edge Function
 *
 * POST body: { userId: string, title: string, body: string, url?: string }
 *
 * Reads VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY from Deno.env.
 * Fetches all push_subscriptions for the given user from Supabase (service role).
 * Sends a Web Push notification to every subscription using the Web Push
 * protocol (RFC 8030 / RFC 8291 / RFC 8292) implemented with the Deno
 * built-in WebCrypto API — no npm packages required.
 */

import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestBody {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

interface PushSubscriptionKeys {
  p256dh: string; // base64url-encoded ECDH public key
  auth: string;   // base64url-encoded 16-byte auth secret
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  subscription: PushSubscriptionJSON;
}

// ─── Helpers: base64url ───────────────────────────────────────────────────────

function base64urlToUint8Array(base64url: string): Uint8Array {
  // Normalise base64url → base64
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

// ─── Helpers: random bytes ────────────────────────────────────────────────────

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// ─── Helpers: concat Uint8Arrays ─────────────────────────────────────────────

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// ─── VAPID JWT ────────────────────────────────────────────────────────────────

/**
 * Build and sign a VAPID JWT (RFC 8292) using ES256 (ECDSA P-256).
 * The private key is expected as a raw 32-byte base64url string.
 */
async function buildVapidJwt(
  audience: string, // e.g. "https://fcm.googleapis.com"
  subject: string,  // mailto: or https: contact URL
  vapidPrivateKeyB64url: string,
  vapidPublicKeyB64url: string,
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const headerB64 = uint8ArrayToBase64url(
    new TextEncoder().encode(JSON.stringify(header)),
  );
  const payloadB64 = uint8ArrayToBase64url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signingInput = `${headerB64}.${payloadB64}`;

  // Import raw private key bytes as ECDSA P-256 key
  const rawPrivateKey = base64urlToUint8Array(vapidPrivateKeyB64url);

  // Build a JWK from the raw private key + public key for import
  const publicKeyBytes = base64urlToUint8Array(vapidPublicKeyB64url);
  // Uncompressed public key: 0x04 || x (32 bytes) || y (32 bytes)
  const xBytes = publicKeyBytes.slice(1, 33);
  const yBytes = publicKeyBytes.slice(33, 65);

  const privateJwk = {
    kty: "EC",
    crv: "P-256",
    d: uint8ArrayToBase64url(rawPrivateKey),
    x: uint8ArrayToBase64url(xBytes),
    y: uint8ArrayToBase64url(yBytes),
  };

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    privateJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  const signatureB64 = uint8ArrayToBase64url(new Uint8Array(signature));
  return `${signingInput}.${signatureB64}`;
}

// ─── Web Push payload encryption (RFC 8291 — aesgcm128 / aes128gcm) ──────────

/**
 * Encrypt a push notification payload using the aes128gcm content encoding
 * defined in RFC 8291. Returns the encrypted body as a Uint8Array.
 */
async function encryptPayload(
  plaintext: Uint8Array,
  subscriptionPublicKeyB64url: string, // p256dh
  authSecretB64url: string,            // auth
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const salt = randomBytes(16);

  // ── 1. Import subscriber's public key (p256dh) ─────────────────────────────
  const receiverPublicKeyBytes = base64urlToUint8Array(subscriptionPublicKeyB64url);
  const receiverPublicKey = await crypto.subtle.importKey(
    "raw",
    receiverPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );

  // ── 2. Generate an ephemeral ECDH key pair ────────────────────────────────
  const senderKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );

  const senderPublicKeyBuffer = await crypto.subtle.exportKey("raw", senderKeyPair.publicKey);
  const senderPublicKey = new Uint8Array(senderPublicKeyBuffer);

  // ── 3. ECDH shared secret ──────────────────────────────────────────────────
  const sharedSecretBuffer = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverPublicKey },
    senderKeyPair.privateKey,
    256,
  );
  const sharedSecret = new Uint8Array(sharedSecretBuffer);

  // ── 4. auth secret ────────────────────────────────────────────────────────
  const authSecret = base64urlToUint8Array(authSecretB64url);

  // ── 5. HKDF to derive PRK and then content-encryption key + nonce ─────────
  // RFC 8291 §3.3
  const encoder = new TextEncoder();

  // PRK = HKDF-Extract(auth_secret, ecdh_secret)
  const prkKey = await crypto.subtle.importKey(
    "raw",
    authSecret,
    { name: "HKDF" },
    false,
    ["deriveBits"],
  );

  // key_info = "WebPush: info\x00" || receiver_public || sender_public
  const keyInfo = concatBytes(
    encoder.encode("WebPush: info\x00"),
    receiverPublicKeyBytes,
    senderPublicKey,
  );

  const prkBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: sharedSecret, info: keyInfo },
    prkKey,
    256,
  );
  const ikm = new Uint8Array(prkBits);

  // IKM key for final HKDF
  const ikmKey = await crypto.subtle.importKey(
    "raw",
    ikm,
    { name: "HKDF" },
    false,
    ["deriveBits"],
  );

  // CEK (content encryption key) — 16 bytes
  const cekInfo = concatBytes(
    encoder.encode("Content-Encoding: aes128gcm\x00"),
  );
  const cekBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: cekInfo },
    ikmKey,
    128,
  );
  const cek = new Uint8Array(cekBits);

  // Nonce — 12 bytes
  const nonceInfo = concatBytes(
    encoder.encode("Content-Encoding: nonce\x00"),
  );
  const nonceBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: nonceInfo },
    ikmKey,
    96,
  );
  const nonce = new Uint8Array(nonceBits);

  // ── 6. Encrypt with AES-128-GCM ───────────────────────────────────────────
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cek,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  // Pad plaintext: append 0x02 delimiter + zero padding (RFC 8291 §4)
  // Minimum record size is 18 bytes; we keep it simple with a single 0x02 suffix.
  const paddedPlaintext = concatBytes(plaintext, new Uint8Array([0x02]));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPlaintext,
  );

  const ciphertext = new Uint8Array(encryptedBuffer);

  return { ciphertext, salt, serverPublicKey: senderPublicKey };
}

/**
 * Build the full aes128gcm encrypted body including the RFC 8291 header:
 *   salt (16 bytes) || rs (4 bytes, big-endian) || keylen (1 byte) || dh_key || ciphertext
 */
function buildEncryptedBody(
  salt: Uint8Array,
  serverPublicKey: Uint8Array,
  ciphertext: Uint8Array,
  recordSize: number = 4096,
): Uint8Array {
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, recordSize, false); // big-endian

  const keylenByte = new Uint8Array([serverPublicKey.length]); // 65 for uncompressed P-256

  return concatBytes(salt, rsBytes, keylenByte, serverPublicKey, ciphertext);
}

// ─── Send a single push notification ─────────────────────────────────────────

async function sendPushNotification(
  subscription: PushSubscriptionJSON,
  notificationPayload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  contactSubject: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const endpoint = subscription.endpoint;

  // Derive audience from endpoint origin
  const endpointUrl = new URL(endpoint);
  const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

  // Build VAPID JWT
  const jwt = await buildVapidJwt(audience, contactSubject, vapidPrivateKey, vapidPublicKey);

  // Encrypt payload
  const plaintext = new TextEncoder().encode(notificationPayload);
  const { ciphertext, salt, serverPublicKey } = await encryptPayload(
    plaintext,
    subscription.keys.p256dh,
    subscription.keys.auth,
  );

  const body = buildEncryptedBody(salt, serverPublicKey, ciphertext);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "2419200", // 4 weeks in seconds
      "Authorization": `vapid t=${jwt},k=${vapidPublicKey}`,
    },
    body,
  });

  const responseBody = await response.text();
  return { ok: response.ok, status: response.status, body: responseBody };
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────

const RATE_LIMIT_MAX = 10;       // max requests per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds in ms

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // No existing window or window has expired — start a fresh one
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { userId, title, body: notificationBody, url } = body;

  if (!userId || !title || !notificationBody) {
    return new Response(
      JSON.stringify({ error: "userId, title, and body are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Rate limit: max 10 requests per userId per 60 seconds
  if (isRateLimited(userId)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded" }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  // Read VAPID keys from environment
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY env vars");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: missing VAPID keys" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // Initialise Supabase client with service role (bypasses RLS)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch all push subscriptions for this user
  const { data: rows, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("id, subscription")
    .eq("user_id", userId);

  if (fetchError) {
    console.error("Failed to fetch push subscriptions:", fetchError.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch subscriptions" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!rows || rows.length === 0) {
    return new Response(
      JSON.stringify({ sent: 0, message: "No subscriptions found for user" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Build the notification payload JSON string
  const payload = JSON.stringify({
    title,
    body: notificationBody,
    url: url ?? "/",
  });

  // Contact subject for VAPID — use the Supabase project URL as a fallback
  const contactSubject = `mailto:admin@${new URL(supabaseUrl).hostname}`;

  // Send to every subscription; collect stale ones to remove
  const staleIds: string[] = [];
  let sentCount = 0;

  await Promise.allSettled(
    (rows as Array<{ id: string; subscription: PushSubscriptionJSON }>).map(
      async (row) => {
        try {
          const result = await sendPushNotification(
            row.subscription,
            payload,
            vapidPublicKey,
            vapidPrivateKey,
            contactSubject,
          );

          if (result.ok || result.status === 201) {
            sentCount++;
          } else if (result.status === 404 || result.status === 410) {
            // Subscription has expired or is no longer valid
            staleIds.push(row.id);
            console.warn(
              `Stale subscription ${row.id} (${result.status}), queued for removal`,
            );
          } else {
            console.error(
              `Push failed for subscription ${row.id}: ${result.status} ${result.body}`,
            );
          }
        } catch (error) {
          console.error(`Network error sending to subscription ${row.id}:`, error);
        }
      },
    ),
  );

  // Clean up stale subscriptions
  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", staleIds);

    if (deleteError) {
      console.error("Failed to delete stale subscriptions:", deleteError.message);
    }
  }

  return new Response(
    JSON.stringify({
      sent: sentCount,
      staleRemoved: staleIds.length,
      total: rows.length,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
