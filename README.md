# SPYDER X CLOUD

React 19 + Vite frontend with a separate Express API foundation. Hash routes keep the frontend compatible with static hosting.

## Project layout

- `src/app/` — app-level route and theme state
- `src/components/` — shared header, footer, form, and UI components
- `src/pages/` — route page components
- `src/data/` — public, non-secret site content
- `src/assets/images/` — source and optimized website images
- `src/styles/` — global styles
- `server/` — API configuration, routes, and middleware; server-only secrets must stay here
- `public/` — static hosting headers
- `maintenance-page/` — optional standalone maintenance screen for manual emergency uploads

## Firebase authentication and client area

- Email/password registration sends a Firebase verification email. Sign-in is rejected until `emailVerified` is true.
- Google sign-in, if enabled, is configured under Firebase Console → Authentication → Sign-in method. This project uses Firebase Authentication, not Netlify Identity.
- Auth persistence uses browser-session persistence; the `#/dashboard` route checks Firebase auth state and verified email, and the API independently verifies revocation-checked Firebase ID tokens.
- The API creates/updates a minimal user profile in Firestore based on the verified token. Firestore rules are in `firestore.rules`; deploy them with `firebase deploy --only firestore:rules` after selecting the correct Firebase project.
- In Firebase Console, enable **Authentication → Email/Password**, create the Firestore database, configure the verification-email template and authorized domains, enable email-enumeration protection, and restrict the web API key by production HTTP referrers and the Firebase APIs the app needs.
- Deploy the rules with `npx firebase-tools deploy --only firestore:rules` after selecting the correct Firebase project (`npx firebase-tools login`, then `npx firebase-tools use --add`).
- For App Check, register the web app with reCAPTCHA v3 in Firebase Console, set `VITE_FIREBASE_APPCHECK_SITE_KEY`, then set the API runtime variable `FIREBASE_APP_CHECK_ENFORCED=true`. Do not enforce it until real browser tokens are verified in staging.
- Copy `.env.example` to `.env.local` for Vite web values. For the API, use a server-only `.env` or hosting-provider secret manager. Locally, you can save the downloaded Admin service-account JSON as `secrets/firebase-admin.json` (the `secrets/` folder is Git-ignored) and set `FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=secrets/firebase-admin.json`; alternatively configure `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` directly in the API secret manager. Never put Admin credentials in `VITE_*`, frontend code, Firestore, or Git.
- The Firebase web config and Firebase web API key are **not secrets**. Vite embeds `VITE_*` settings in client JavaScript, and browser Firebase Auth requires these project identifiers. They cannot be hidden from Inspect/Network. Security comes from verified Firebase Auth, key restrictions, App Check, Firestore rules, and server-side authorization. The Admin service-account private key is the credential that must remain secret.
- The SMM page has a test chooser/checkout. Its sample promotion listings are all priced at ₹1 per unit and are not production offers. Paid orders are verified against Cashfree by the API, then sent to the configured Discord webhook for manual fulfillment.
- The API needs a Firebase Admin service-account secret before `/api/client/session` and profile access are available. Without it, dashboard UI can authenticate with Firebase but will report API setup is incomplete.
- Enable the **Cloud Firestore API** for the Firebase project in Google Cloud Console. If API logs instead show Firestore `PERMISSION_DENIED`, open **IAM & Admin → IAM** and grant the service account's `client_email` the **Cloud Datastore User** role (`roles/datastore.user`). API activation and IAM changes may take a few minutes to propagate; Firestore Security Rules do not grant IAM permissions to the Admin SDK.

## Local development

1. Install Node.js LTS and run `npm install`.
2. Set the Firebase web config in `.env.local` (this workspace already has the provided public Firebase web config; this file is Git-ignored), then run `npm run dev`.
3. In Firebase Console, open **Project settings → Service accounts → Generate new private key**. Save the downloaded file as `secrets/firebase-admin.json` and set `FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=secrets/firebase-admin.json` in the root `.env`. Run `npm run dev:api` in a second terminal.
4. The API health check is at `/api/health` on port 4000.

## Production build

Netlify continues to host the Vite frontend and `spyderxcloud.in` on its free static hosting. Its `/api/*` rewrite proxies requests to the separate Express API at `https://spyder-x-cloud-api.onrender.com`; Netlify Functions and additional API DNS records are not needed. Deploy the API from `render.yaml` using **New → Blueprint** in Render. If Render assigns a different service hostname, update the `/api/*` destination in `netlify.toml` to that exact URL and redeploy Netlify. Keep the existing apex and `www` DNS records pointed at Netlify.

Store `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON`, `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, and `DISCORD_ORDER_WEBHOOK_URL` in the Render API service's Environment settings. Set `CASHFREE_ENV=sandbox` for testing. Create a Discord channel webhook in Discord and paste its URL directly into Render's secret field—never into chat, Git, frontend code, or Netlify. Netlify needs no private secrets for the frontend build. Keep `.env` and `secrets/` local; neither host needs a committed `.env` file.

Test with a verified Firebase account and Cashfree sandbox credentials. After a successful payment the API checks Cashfree's server-side order status and posts the order ID, customer contact, selected listing, quantity, target URL, and amount to Discord. Change the sample listings and their server-owned rates in `shared/smmCatalog.js` before taking real payments. Then configure matching production Cashfree credentials in Render and set `CASHFREE_ENV=production` only after end-to-end testing and review.

Add `spyderxcloud.in` and `www.spyderxcloud.in` under Firebase Authentication **Settings → Authorized domains**. The Render API's `FRONTEND_ORIGINS` is configured for those site origins; browser requests continue using same-origin `/api/*` URLs through Netlify.

The public Firebase web-app config has a source fallback, so the Netlify build does not depend on a local `.env.local`. Firebase web values are public client configuration, not Admin credentials. Only set `VITE_FIREBASE_*` build variables in Netlify if intentionally overriding the source defaults.

## Secret-handling rules

- Anything shipped to a browser is public: minification, obfuscation, React, and hidden form fields do not protect secrets from DevTools or network inspection.
- Keep private API keys and credentials only in server environment variables or the deployment provider's secret manager. Never use a `VITE_` prefix for secrets; Vite deliberately embeds `VITE_` variables in the client bundle.
- `.env` and key files are ignored by Git. `.env.example` contains names/placeholders only; never commit real values. Rotate any key that was exposed.
- Login, registration, and password reset use Firebase Authentication; the dashboard requires a verified email, and protected API routes independently validate revocation-checked ID tokens. Contact form submission still needs a backend endpoint. No payment or order checkout is currently enabled.

## Security baseline

The API currently sets Helmet headers, allows configured CORS origins only, applies global and client-route request limits, restricts request body sizes, disables `x-powered-by`, validates runtime configuration, returns sanitized errors, and verifies Firebase ID tokens with revocation checks plus the email-verified claim. The current rate-limit store is in-memory; use a shared store if the API runs on multiple instances. If the API is deployed on a different origin, add only that exact origin to CORS and the frontend `connect-src` CSP. This is a starting point, not a security certification. Before launch, enable Firebase App Check, configure alerts/logging without secrets, backups, monitoring, and deployment-specific security testing.
