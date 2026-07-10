// functions/api/checkout.js
// Cloudflare Pages Function — creates a Stripe Checkout Session for the cart.
//
// No npm dependencies: talks to Stripe's REST API directly with fetch, so it
// runs on Pages with zero build step. Prices live HERE (server-side) and are the
// only source of truth — the client's copy is for display only and is never trusted.
//
// Required env var (Cloudflare Pages → Settings → Environment variables):
//   STRIPE_SECRET_KEY   sk_live_… (or sk_test_… while testing)
//
// Body: { items: [{ id, variant?, qty?, desc? }], email? }
//   or:  { donation: <cents>, email? }

const CATALOG = {
  hoodie: {
    name: 'The respira hoodie',
    amount: 9800,                       // $98.00
    variants: ['terracotta', 'dark choco'],
    shipped: true,
  },
  reunion: {
    name: 'The reunion mat',
    amount: 14500,                      // $145.00
    variants: ['terracotta', 'dune', 'stone'],
    shipped: true,
  },
  'framed-med': {
    name: 'Framed print · 12×18″ — reservation deposit',
    amount: 990,                        // 10% of $99
    balance: 8910,
    shipped: false,
  },
  'framed-lg': {
    name: 'Framed print · 18×24″ — reservation deposit',
    amount: 1490,                       // 10% of $149
    balance: 13410,
    shipped: false,
  },
};

const MAX_QTY = 20;
const DONATION_MIN = 100;               // $1
const DONATION_MAX = 1000000;           // $10,000

// countries we'll ship physical goods to
const SHIP_COUNTRIES = [
  'US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'FR', 'DE', 'NL', 'ES',
  'IT', 'PT', 'SE', 'DK', 'NO', 'FI', 'BE', 'AT', 'CH',
];

// Flatten a nested object/array into Stripe's form-encoded bracket syntax,
// e.g. { a:{ b:[1] } } -> "a[b][0]=1". Arrays are plain objects with numeric keys.
function formEncode(obj, prefix, out) {
  out = out || [];
  for (const key in obj) {
    const val = obj[key];
    if (val === null || val === undefined) continue;
    const k = prefix ? `${prefix}[${key}]` : key;
    if (typeof val === 'object') formEncode(val, k, out);
    else out.push(`${encodeURIComponent(k)}=${encodeURIComponent(val)}`);
  }
  return out;
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const key = env.STRIPE_SECRET_KEY;
  if (!key) return json({ error: 'not_configured' }, 503);

  let body;
  try { body = await request.json(); }
  catch (e) { return json({ error: 'bad_request' }, 400); }

  const origin = new URL(request.url).origin;
  const email =
    typeof body.email === 'string' && body.email.indexOf('@') > 0
      ? body.email.trim()
      : null;

  const params = {
    mode: 'payment',
    success_url: `${origin}/?order=success`,
    cancel_url: `${origin}/?order=cancelled`,
    billing_address_collection: 'auto',
    line_items: [],
    metadata: {},
  };
  if (email) params.customer_email = email;

  // ── donation path ───────────────────────────────────────────────
  if (body.donation !== undefined) {
    const amt = Math.round(Number(body.donation));
    if (!Number.isFinite(amt) || amt < DONATION_MIN || amt > DONATION_MAX) {
      return json({ error: 'invalid_amount' }, 400);
    }
    params.line_items.push({
      price_data: {
        currency: 'usd',
        unit_amount: amt,
        product_data: { name: 'Support respira' },
      },
      quantity: 1,
    });
    params.submit_type = 'donate';
    params.metadata.kind = 'donation';
  } else {
    // ── cart path ─────────────────────────────────────────────────
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return json({ error: 'empty_cart' }, 400);

    let needsShipping = false;
    for (const raw of items) {
      const prod = raw && CATALOG[raw.id];
      if (!prod) return json({ error: 'unknown_item', id: raw && raw.id }, 400);

      let qty = Math.round(Number(raw.qty) || 1);
      if (qty < 1) qty = 1;
      if (qty > MAX_QTY) qty = MAX_QTY;

      let name = prod.name;
      const variant = typeof raw.variant === 'string' ? raw.variant : '';
      if (prod.variants && prod.variants.indexOf(variant) >= 0) name += ` — ${variant}`;

      const li = {
        price_data: {
          currency: 'usd',
          unit_amount: prod.amount,
          product_data: { name },
        },
        quantity: qty,
      };
      const desc = typeof raw.desc === 'string' ? raw.desc.trim().slice(0, 300) : '';
      if (desc) li.price_data.product_data.description = desc;
      if (prod.balance) {
        li.price_data.product_data.description =
          (desc ? desc + ' · ' : '') +
          `balance of $${(prod.balance / 100).toFixed(2)} due when it ships`;
      }

      params.line_items.push(li);
      if (prod.shipped) needsShipping = true;
    }

    if (needsShipping) {
      params.shipping_address_collection = { allowed_countries: SHIP_COUNTRIES };
      params.phone_number_collection = { enabled: true };
    }
    params.metadata.kind = 'cart';
  }

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formEncode(params).join('&'),
  });

  const data = await resp.json();
  if (!resp.ok) {
    return json({ error: (data.error && data.error.message) || 'stripe_error' }, 502);
  }
  return json({ url: data.url });
}
