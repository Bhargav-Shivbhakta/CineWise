# Cinewise

Cinewise is a professional movie and TV discovery application that turns a watchlist into an optimized monthly streaming plan.

## What works now

- Search and filter movies and series
- Country/region preference
- Provider, subscription, rental, and purchase comparisons
- Add/remove titles from a persistent watch plan
- Assign each title to one of the next six months
- Exact subscription-combination optimizer
- Ad-free and cheapest-overall optimization modes
- Existing-subscription and monthly-budget controls
- “What to watch” recommendations from subscriptions you already own
- Permanent watched history with automatic removal from the active plan
- Google sign-in and cross-device Cloud Firestore synchronization
- Responsive desktop and mobile interface
- Keyboard search shortcut (`Cmd/Ctrl + K`)
- Live TMDB multi-search and daily trending titles
- Country-specific movie and TV provider availability
- Optional IMDb rating enrichment through OMDb
- Watchmode enrichment across 200+ legal streaming services
- Seven-day edge caching to conserve Watchmode API credits
- Secure server-side credentials through Vercel environment variables

The included catalog is an automatic offline fallback. With the Vercel environment variable configured, the same interface switches to live TMDB results. Watchlists and preferences persist in the browser with `localStorage`.

## Run locally

No build step is required:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy the live version on Vercel

1. Import this GitHub repository into Vercel.
2. Add `TMDB_READ_TOKEN` in Project Settings → Environment Variables. A v3 key can instead be saved as `TMDB_API_KEY`.
3. Optionally add `OMDB_API_KEY` to display IMDb ratings returned through OMDb.
4. Add `WATCHMODE_API_KEY` for expanded platform coverage and direct links.
5. Redeploy the project.

Never commit `.env`, `.env.local`, or an API credential. The included `.gitignore` protects these files.

The Watchmode endpoint is requested only when a live title is opened or added to a plan. Each title/source request made with a TMDB ID costs two Watchmode credits, and successful responses are edge-cached for seven days. Search and trending traffic use TMDB and do not consume Watchmode credits. Watchmode's free plan currently permits up to three enabled countries; configure those countries in the Watchmode dashboard to match the regions you use most.

## Enable permanent Firebase history

1. Create a Firebase project and register a Web app.
2. In Authentication → Sign-in method, enable Google.
3. In Authentication → Settings → Authorized domains, add your GitHub Pages domain and Vercel domain.
4. Create a Cloud Firestore database.
5. Copy the contents of `firestore.rules` into Firestore → Rules and publish them. The rules restrict every record to its signed-in owner.
6. Copy Firebase's web configuration values into `firebase-config.js`.
7. Commit and redeploy, then use the **Sign in** button in Cinewise.

Firestore is the source of truth after sign-in. The browser retains a local fallback for offline startup, and an existing local plan is migrated into Firestore the first time the account signs in. Watched titles are stored under `users/{uid}/watched`, planned titles under `users/{uid}/watchlist`, and preferences under `users/{uid}/profile/preferences`.

## Production data architecture

Use TMDB for search, title metadata, artwork, genres, ratings, external IDs, and country-specific provider availability. Use the contracted JustWatch Partner API for exact retail prices and direct offer links. IMDb's licensed data product is the correct long-term source for official IMDb ratings; OMDb support is included as an optional prototype enrichment.

API credentials must not be placed in this repository or client-side JavaScript. A serverless API proxy should hold credentials, normalize responses, cache provider data briefly, and return only the fields used by the interface.

Suggested endpoints:

- `GET /api/search?q=&region=&type=`
- `GET /api/title/:type/:tmdbId?region=`
- `GET /api/offers/:type/:tmdbId?region=`
- `GET /api/providers?region=`

## Accuracy rules

- Display region and currency on every offer view.
- Separate free-with-ads, ad-supported subscription, ad-free subscription, rental, and purchase.
- Treat provider prices as estimates and link users to the provider for confirmation.
- Show when availability was last checked.
- Attribute TMDB and JustWatch according to their current terms.
- Never scrape provider websites or claim universal completeness.

## Deployment

The current static demonstration can be deployed directly to GitHub Pages. The production version should deploy the frontend to Cloudflare Pages or Vercel and place its serverless API in the same project.
