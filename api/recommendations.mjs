import { tmdb, send, fail, summary } from "./_tmdb.mjs";

const PROVIDER_IDS = {
  max: [1899],
  hulu: [15],
  netflix: [8],
  apple: [350],
  prime: [9],
  disney: [337],
  paramount: [531],
  peacock: [386, 387]
};

const PROVIDER_NAMES = {
  max: "Max", hulu: "Hulu", netflix: "Netflix", apple: "Apple TV+",
  prime: "Prime Video", disney: "Disney+", paramount: "Paramount+", peacock: "Peacock"
};

export default async function handler(req, res) {
  try {
    const region = String(req.query.region || "US").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || "US";
    const providers = [...new Set(String(req.query.providers || "").split(","))]
      .filter(provider => PROVIDER_IDS[provider])
      .slice(0, 8);
    if (!providers.length) return send(res, 200, { results: [], providers: [], region }, 21600);

    const requests = providers.flatMap(provider => ["movie", "tv"].map(async type => {
      const data = await tmdb(`/discover/${type}`, {
        watch_region: region,
        with_watch_providers: PROVIDER_IDS[provider].join("|"),
        with_watch_monetization_types: "flatrate",
        sort_by: "popularity.desc",
        include_adult: false,
        language: "en-US",
        page: 1
      });
      return data.results.slice(0, 10).map(item => ({
        ...summary({ ...item, media_type: type }),
        offers: [{ provider, providerName: PROVIDER_NAMES[provider], kind: "subscription", adfree: true, price: null }]
      }));
    }));

    const groups = await Promise.all(requests);
    const merged = new Map();
    for (const title of groups.flat()) {
      const existing = merged.get(title.id);
      if (!existing) merged.set(title.id, title);
      else if (!existing.offers.some(offer => offer.provider === title.offers[0].provider)) existing.offers.push(title.offers[0]);
    }
    const results = [...merged.values()]
      .sort((a, b) => Number(b.rating) - Number(a.rating) || b.match - a.match)
      .slice(0, 36);
    return send(res, 200, { results, providers, region }, 21600);
  } catch (error) { return fail(res, error); }
}
