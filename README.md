# SPYDER X CLOUD

React 19 + Vite frontend with an Express API, Firebase Authentication/Firestore, Cashfree checkout, and Discord order notifications.

## Local development

1. Install Node.js LTS and run `npm install`.
2. Copy `.env.example` to `.env.local` for Vite's public Firebase web configuration.
3. For the API, keep Firebase Admin JSON under the Git-ignored `secrets/` directory and set `FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=secrets/firebase-admin.json` in the root `.env`. Set Cashfree sandbox keys and `DISCORD_ORDER_WEBHOOK_URL` in the same local-only `.env`.
4. Run `npm run dev` and `npm run dev:api` in separate terminals. The API health check is `/api/health` on port 4000.

## Netlify deployment

Netlify can host both the website and API using the function in `netlify/functions/api.mjs`. The `/api/*` rewrite is defined in `netlify.toml` and `public/_redirects`; no Render service or separate API domain is needed. Connect the GitHub repo to the existing Netlify site, use build command `npm run build`, and publish directory `dist`.

In Netlify **Site configuration → Environment variables**, set these server-side values and scope them to Functions:

- `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` — complete Firebase Admin service-account JSON
- `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` — matching sandbox credentials for testing
- `CASHFREE_ENV=sandbox`
- `DISCORD_ORDER_WEBHOOK_URL` — the Discord channel webhook

Never place these secrets in `VITE_*` variables, frontend code, or Git. After changing environment variables, redeploy so the function receives them. Netlify Function usage is subject to the selected plan's quota.

## Payment test

The SMM chooser currently contains demo promotion listings at ₹1 per unit. A verified Firebase user selects a listing, quantity, and target URL, completes Cashfree checkout, and the API verifies the paid status server-side before sending order details to Discord for manual fulfillment. Replace demo listings and server-owned rates in `shared/smmCatalog.js` before accepting real orders. Use Cashfree production credentials only after end-to-end sandbox testing.

Add `spyderxcloud.in` and `www.spyderxcloud.in` to Firebase Authentication **Authorized domains**. Enable Email/Password sign-in, create Firestore, and ensure the Firebase Admin service account has the required Firestore IAM access.

## Secrets and security

- `.env`, `.env.local`, and `secrets/` are Git-ignored. `.env.example` contains placeholders only.
- Firebase web-app configuration is public client configuration; Firebase Admin JSON and Cashfree/Discord credentials are private server secrets.
- The API verifies Firebase ID tokens and email verification, validates prices server-side, verifies Cashfree's order status, and posts fulfillment details only after confirmed payment.
- The in-memory rate limiter is not shared across instances. Enable Firebase App Check and production monitoring before launch.
