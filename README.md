# Travel-Tie

Travel-Tie is a client-side travel planning web app. You can browse destinations around the world, work out a trip budget, convert currencies, and keep your saved places and budgets in a personal profile. It runs entirely in the browser: static HTML, CSS and JavaScript, with Firebase for sign-in and data storage.

## Features

- **Destination browsing**: search and filter curated destinations by region and budget, view details, highlights and tips, see them on an interactive map, and read or leave reviews.
- **Budget calculator**: estimate trip costs (accommodation, food, transport, activities and more) with a full cost breakdown and money-saving tips.
- **Currency converter**: live exchange rates for 48 currencies.
- **User accounts**: email/password and Google sign-in, password reset, and password change.
- **User profiles**: edit your display name and details, upload an avatar and cover photo, and manage your saved destinations and saved budget calculations.
- **Save before signing in**: if you try to save while signed out, the action is kept and finished after you log in.

## Tech stack

- Vanilla HTML5, CSS3 and JavaScript (ES modules), with no build step
- [Firebase Authentication](https://firebase.google.com/docs/auth) (email/password and Google)
- [Cloud Firestore](https://firebase.google.com/docs/firestore) for profiles, saved destinations, calculations and reviews
- [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles for maps
- [ExchangeRate-API](https://www.exchangerate-api.com/) for currency rates
- Font Awesome and Google Fonts

## Project structure

```
Travel-Tie/
├── index.html              # Landing page / dashboard
├── pages/
│   ├── destinations.html   # Destination browser
│   ├── calculator.html     # Budget calculator and currency converter
│   └── profile.html        # User profile, saved places, saved budgets
├── js/
│   ├── firebase.js         # Firebase init + window.TT helpers (auth, Firestore)
│   ├── auth.js             # Sign-in / sign-up / reset UI
│   ├── dashboard.js        # Landing page logic and map
│   ├── destinations.js     # Destination data, filters, modal, reviews
│   ├── calculator.js       # Budget calculator and currency converter
│   ├── profile.js          # Profile page
│   ├── modals.js           # Saved places / saved calculations modals
│   └── config.example.js   # Template for optional local config (js/config.js)
├── css/                    # Stylesheets (main, auth, dashboard, destinations, calculator)
├── firestore.rules         # Firestore Security Rules
└── firebase.json           # Firebase CLI config (rules + hosting headers)
```

### Firestore data layout

| Path | Contents | Access |
| --- | --- | --- |
| `users/{uid}` | Profile (name, email, avatar, cover photo) | Owner only |
| `users/{uid}/savedDestinations/{id}` | Bookmarked destinations | Owner only |
| `users/{uid}/calculations/{id}` | Saved budget calculations | Owner only |
| `destinations/{id}` | Destination catalogue | Public read, no client writes |
| `destinations/{id}/reviews/{id}` | Reviews | Public read, signed-in users create their own |

## Local setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/dioxaaa/Travel-Tie.git
   cd Travel-Tie
   ```
2. **Create a Firebase project** at the [Firebase console](https://console.firebase.google.com/):
   - Add a **Web app** and copy its config.
   - Under **Authentication > Sign-in method**, enable **Email/Password** and **Google**.
   - Under **Authentication > Settings > Authorized domains**, add `localhost` and your deployed domain.
   - Create a **Cloud Firestore** database.
3. **Fill in the config** in `js/firebase.js`: replace the values in the `firebaseConfig` object (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId`) with your own. If you use a different project ID, also update the `travel-tie.firebaseapp.com` entry in the Content-Security-Policy `frame-src` (in each HTML file and in `firebase.json`).
4. **Optional: add an ExchangeRate-API key.** Copy `js/config.example.js` to `js/config.js` and set `exchangeRateApiKey`. `js/config.js` is git-ignored. If you skip this step, the converter uses the free, keyless `open.er-api.com` endpoint.
5. **Deploy the Firestore rules** (requires the [Firebase CLI](https://firebase.google.com/docs/cli)):
   ```bash
   firebase login
   firebase use --add          # pick your project
   firebase deploy --only firestore:rules
   ```
6. **Serve over HTTP.** Don't open the files with `file://`, because ES modules, Firebase Auth and Google sign-in all need a real origin. Any static server works:
   ```bash
   python3 -m http.server 8000
   # or: npx serve .
   ```
   Then open http://localhost:8000.

## Security

- **The Firebase web API key is public by design.** The `firebaseConfig` values, including `apiKey`, only identify your Firebase project to Google's servers. They are not secret and anyone can read them in the browser. Committing them doesn't give anyone access to your data. What protects the data is:
  - **Firestore Security Rules** (`firestore.rules`): everything is denied by default. Users can only read and write their own `users/{uid}` document and its subcollections (`request.auth != null && request.auth.uid == userId`). The destinations catalogue is read-only, and reviews can only be created by signed-in users, as themselves.
  - **Firebase App Check**: turn it on (reCAPTCHA Enterprise or v3) and enforce it for Firestore and Auth, so only your real app can call your backend.
  - **API key restrictions**: in Google Cloud Console > APIs & Services > Credentials, restrict the browser key with **HTTP referrers** (your domains plus `localhost`) and limit it to the Firebase APIs you use.
- **Never commit service-account credentials** (`serviceAccountKey*.json` or any Admin SDK private key) or other secret keys. Those give full admin access and bypass the security rules. `.gitignore` already excludes them, along with `.env` and `js/config.js`. If one is ever committed, rotate it right away: deleting the file doesn't remove it from git history.
- Third-party keys loaded in the browser (such as the optional ExchangeRate-API key) are still visible to visitors. Keep them in the git-ignored `js/config.js` and use the provider's domain restrictions or quotas.
- Every page sets a Content-Security-Policy `<meta>` tag that only allows the Firebase/Google, CDN, map and exchange-rate domains the app needs. If you host on Firebase Hosting, `firebase.json` also sends CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` and `Referrer-Policy` as real HTTP headers.

## License

[MIT](LICENSE)
