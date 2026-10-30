# Travel-Tie
## Currency converter proxy

The converter calls `/api/convert`, a Firebase Cloud Function (`functions/index.js`) that keeps the ExchangeRate-API key server-side, caches rates and rate-limits callers. Deploy with Firebase Hosting so the rewrite in `firebase.json` routes it:

```sh
firebase functions:secrets:set EXCHANGE_KEY
firebase deploy --only functions,hosting
```

Set `window.TT_CONFIG.convertEndpoint` to use a different URL. For local runs, put `EXCHANGE_KEY=...` in `functions/.secret.local` and run `firebase emulators:start --only functions,hosting`.
