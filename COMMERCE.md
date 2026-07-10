# respira commerce

The shop is a **client-side cart** (in `index.html`) plus a **Cloudflare Pages Function**
that creates **Stripe Checkout Sessions**. No per-product payment links, no build step,
no npm dependencies — the Function talks to Stripe's REST API directly.

```
browser cart ──POST /api/checkout──▶ functions/api/checkout.js ──▶ Stripe Checkout ──▶ redirect back
```

## Files

| File | Role |
|---|---|
| `index.html` (cart block near `</body>`) | cart UI, localStorage, add-to-cart, checkout redirect |
| `functions/api/checkout.js` | creates the Stripe Checkout Session — **prices live here** |
| `functions/api/stripe-webhook.js` | optional: verified webhook receiver for fulfilment (stub) |

## Turning payments ON

1. **Create a Stripe account** and get your secret key (Dashboard → Developers → API keys).
   Use `sk_test_…` while testing, `sk_live_…` for real charges.
2. **Cloudflare → Workers & Pages → respira-5cr → Settings → Environment variables**, add:
   - `STRIPE_SECRET_KEY = sk_live_…`  (Production; add the `sk_test_…` to Preview if you want)
3. **Redeploy** (any push, or "Retry deployment"). Env vars only take effect on a new build.

That's it — the "add to cart" / "checkout" buttons go live automatically. Until the key is
set, `/api/checkout` returns `503 not_configured` and the UI shows
"checkout isn't switched on yet" (nothing breaks).

## Prices — one source of truth

Prices are defined **only** in `functions/api/checkout.js` (`CATALOG`, in cents).
The client copy in `index.html` is for display and is never trusted. To change a price,
edit the Function. Current catalog:

| id | product | charge |
|---|---|---|
| `hoodie` | the respira hoodie | $98.00 |
| `reunion` | the reunion mat | $145.00 |
| `framed-med` | framed print 12×18″ | $9.90 deposit (10% of $99; $89.10 balance on ship) |
| `framed-lg` | framed print 18×24″ | $14.90 deposit (10% of $149; $134.10 balance on ship) |
| _donation_ | Support respira | customer-chosen amount |

Physical goods (`hoodie`, `reunion`) collect a shipping address + phone at checkout.

## Framed-print balances

The cart only charges the 10% **deposit**. Collecting the remaining balance when the piece
ships is currently **manual** (create an invoice in Stripe, or a one-off payment link). If you
want that automated, that's the main reason to build out `stripe-webhook.js` + a small
order-tracking store.

## Optional: order notifications / fulfilment webhook

`functions/api/stripe-webhook.js` already verifies signatures; it just doesn't *do* anything yet.
To get notified on each sale (or to auto-track deposits/inventory):

1. Stripe → Developers → Webhooks → add endpoint `https://openrespira.org/api/stripe-webhook`,
   subscribe to `checkout.session.completed`.
2. Add the signing secret to Cloudflare env: `STRIPE_WEBHOOK_SECRET = whsec_…`.
3. Fill in the `checkout.session.completed` branch (email yourself, write to a store, etc.).

## Testing

- **Locally:** `npx wrangler pages dev .` serves the site + Functions at `localhost:8788`.
  Without `STRIPE_SECRET_KEY` set, checkout returns `503` (the graceful "not switched on" path).
  To exercise a real session locally, run with a test key:
  `STRIPE_SECRET_KEY=sk_test_… npx wrangler pages dev .`
- **Stripe test cards:** `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
- After a successful test payment Stripe redirects to `/?order=success`, which clears the cart.
