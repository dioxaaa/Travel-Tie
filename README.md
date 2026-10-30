# Travel-Tie

Travel-Tie is a client-side travel planning web app. Browse destinations around the world, work out what a trip will cost with the budget calculator, convert between 48 currencies, and keep your favourite places and saved budgets in a personal profile.

Everything runs in the browser. There is no custom backend: sign-in uses Firebase Authentication, and user data is stored in Cloud Firestore.

## Features

- **Destination browsing**: filter destinations by continent, search them, open a detail modal with highlights and budget estimates, and see them on an interactive Leaflet map.
- **Reviews**: signed-in users can rate destinations and leave comments.
- **Budget calculator**: full cost breakdown (flights, accommodation, food, activities, and more) for any number of travellers.
- **Currency converter**: live exchange rates for 48 currencies.
- **User accounts**: email/password and Google sign-in, password reset, and password change.
- **Profile**: avatar and cover photo, saved places, saved budget history, and account settings.
- **Pending actions**: if you try to save something while signed out, it is kept in `localStorage` and saved after you sign in.

## Tech stack

- Vanilla HTML5, CSS3, and JavaScript (ES modules), with no build step and no framework
- [Firebase](https://firebase.google.com/) Authentication and Cloud Firestore, loaded from the Firebase JS SDK CDN (v10)
- [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles for maps
- [ExchangeRate-API](https://www.exchangerate-api.com/) for currency rates
- Font Awesome icons

## Project structure

```
.
├── index.html            # Landing page / dashboard (hero, featured destinations, map)
├── pages/
│   ├── destinations.html # Destination explorer
│   ├── calculator.html   # Budget calculator + currency converter
│   └── profile.html      # User profile, saved places, budget history, settings
├── js/
│   ├── firebase.js       # Firebase init + window.TT API (auth, Firestore helpers, nav)
│   ├── auth.js           # Sign-in / sign-up forms
│   ├── dashboard.js      # Landing page logic and map
│   ├── destinations.js   # Destination data, filtering, detail modal, reviews
│   ├── calculator.js     # Budget calculator and currency converter
│   ├── profile.js        # Profile page
│   ├── modals.js         # Saved places / saved budgets modals
│   └── config.example.js # Template for optional local config (copy to js/config.js)
├── css/                  # Stylesheets (main, auth, dashboard, destinations, calculator)
├── firestore.rules       # Firestore Security Rules
└── firebase.json         # Firebase CLI config (rules + Hosting security headers)
```

### Firestore data model

| Path | Contents | Access |
| --- | --- | --- |
| `users/{uid}` | profile (name, email, photo, cover) | owner only |
| `users/{uid}/savedDestinations/{id}` | bookmarked destinations | owner only |
| `users/{uid}/calculations/{id}` | saved trip budgets | owner only |
| `destinations/{id}` | destination catalogue | public read, no client writes |
| `destinations/{id}/reviews/{id}` | reviews | public read, signed-in users can create their own |

## Local setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/dioxaaa/Travel-Tie.git
   cd Travel-Tie
   ```

2. **Create a Firebase project** in the [Firebase console](https://console.firebase.google.com/):
   - Add a **Web app** and copy its config object.
   - Under **Authentication → Sign-in method**, enable **Email/Password** and **Google**.
   - Under **Authentication → Settings → Authorised domains**, make sure `localhost` (and your deployed domain) are listed.
   - Create a **Cloud Firestore** database.

3. **Fill in the Firebase config** in `js/firebase.js` (the `firebaseConfig` object), replacing `YOUR_FIREBASE_WEB_API_KEY` and the other values with the ones from your web app.

4. **(Optional) Currency API key.** Copy `js/config.example.js` to `js/config.js` (this file is git-ignored) and set `exchangeRateApiKey`. Without a key, the converter uses the free keyless `open.er-api.com` endpoint.

5. **Deploy the security rules** (requires the [Firebase CLI](https://firebase.google.com/docs/cli)):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # pick your project
   firebase deploy --only firestore:rules
   ```

6. **Serve over HTTP, not `file://`.** The app uses ES modules and Firebase Auth popups, which do not work from `file://`. Any static server works:

   ```bash
   python3 -m http.server 8080
   # or: npx serve .
   # or: firebase serve / firebase emulators:start
   ```

   Then open <http://localhost:8080>.

## Security

**The Firebase web API key is not a secret.** The `apiKey` in `firebaseConfig` only identifies your Firebase project to Google's servers. It has to be shipped to every browser for the app to work, so anyone can read it from the page source. Hiding it does not protect anything. Your data is protected by these instead:

- **Firestore Security Rules** (`firestore.rules`): every rule denies by default, and each user can read and write only their own `users/{uid}` document and subcollections (`request.auth != null && request.auth.uid == userId`). The destination catalogue is read-only, and reviews can only be created by the signed-in author, with field validation. Deploy them with `firebase deploy --only firestore:rules`, and test changes in the Rules Playground or the emulator.
- **Firebase App Check**: enable it (reCAPTCHA Enterprise / v3 provider) and enforce it for Firestore and Authentication, so that only your real app can call your backend resources.
- **API key restrictions**: in Google Cloud Console → APIs & Services → Credentials, restrict the browser key with **HTTP referrers** (your domains plus `localhost`) and limit it to the Firebase APIs the app uses (Identity Toolkit, Token Service, Cloud Firestore, Firebase Installations, and Analytics if you use it).
- **Security headers**: `firebase.json` sets `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy` for Firebase Hosting. Each HTML page also has a `<meta>` CSP that allows only the app's own origin plus the Firebase/Google, CDN, map tile, image, and currency API domains it needs, so it is still protected on other static hosts.

Other third-party keys (such as the ExchangeRate-API key) are also visible in the browser. Keep them in the git-ignored `js/config.js`, and restrict them by domain in the provider's dashboard.

**Never commit service-account credentials** (`serviceAccountKey*.json`, `*-firebase-adminsdk-*.json`), `.env` files, or any other server-side secret. Admin SDK keys bypass the Security Rules entirely. These patterns are in `.gitignore`. If one is ever committed, revoke or rotate it immediately: removing it in a later commit does not remove it from git history.

## License

[MIT](LICENSE)
