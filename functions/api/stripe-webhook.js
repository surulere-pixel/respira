// functions/api/stripe-webhook.js
// Cloudflare Pages Function — receives Stripe webhooks, verifies the signature
// with Web Crypto (no npm deps), and acknowledges the event. This is a working
// stub: payments already succeed without it. Extend the switch below when you
// want to fulfil orders (email yourself, record the sale, chase the deposit
// balance, etc.).
//
// Setup:
//   1. Stripe Dashboard → Developers → Webhooks → add endpoint
//        https://openrespira.org/api/stripe-webhook
//      subscribe to at least: checkout.session.completed
//   2. Copy the signing secret (whsec_…) into Cloudflare Pages env var:
//        STRIPE_WEBHOOK_SECRET

async function verifySignature(payload, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = {};
  for (const kv of sigHeader.split(',')) {
    const i = kv.indexOf('=');
    if (i > 0) parts[kv.slice(0, i)] = kv.slice(i + 1);
  }
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(`${t}.${payload}`));
  const expected = [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // constant-time compare
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const secret = env.STRIPE_WEBHOOK_SECRET;

  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!secret || !(await verifySignature(payload, sig, secret))) {
    return new Response('invalid signature', { status: 400 });
  }

  let event;
  try { event = JSON.parse(payload); }
  catch (e) { return new Response('bad payload', { status: 400 }); }

  switch (event.type) {
    case 'checkout.session.completed': {
      // const session = event.data.object;
      // TODO: fulfil the order — session.customer_details.email, session.amount_total,
      //       session.metadata.kind ('cart' | 'donation'), session.shipping_details, …
      break;
    }
    default:
      break;
  }

  return new Response('ok', { status: 200 });
}
