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
- Responsive desktop and mobile interface
- Keyboard search shortcut (`Cmd/Ctrl + K`)

The included catalog is demonstration data so the complete product can be tested without exposing an API key. Watchlists and preferences persist in the browser with `localStorage`.

## Run locally

No build step is required:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Production data architecture

Use TMDB for search, title metadata, cast, artwork, genres, ratings, and external IDs. Use the contracted JustWatch Partner API for country-specific offers, retail prices, monetization type, and provider links.

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
