import { tmdb, send, fail, mediaType, summary, providerKey } from "./_tmdb.mjs";

async function watchmodeSources(type, id, region) {
  if (!process.env.WATCHMODE_API_KEY) return null;
  const watchmodeType = type === "tv" ? "tv" : "movie";
  const url = new URL(`https://api.watchmode.com/v1/title/${watchmodeType}-${id}/sources/`);
  url.searchParams.set("regions", region);
  const response = await fetch(url, { headers: { "X-API-Key": process.env.WATCHMODE_API_KEY, Accept: "application/json" } });
  if (!response.ok) throw new Error(`Watchmode request failed (${response.status})`);
  return response.json();
}

function normalizeWatchmode(source, tmdbOffers) {
  const kind = { sub:"subscription", rent:"rent", buy:"buy", free:"free", tve:"tve" }[source.type] || source.type;
  const matchingTmdb = tmdbOffers.find(offer => offer.providerName?.toLowerCase() === source.name?.toLowerCase());
  return {
    provider: providerKey(source.name), providerId: `watchmode-${source.source_id}`,
    providerName: source.name, providerLogo: matchingTmdb?.providerLogo || null,
    kind, adfree: kind !== "free", price: Number.isFinite(source.price) ? source.price : null,
    webUrl: source.web_url || null, format: source.format || null,
    seasons: source.seasons ?? null, episodes: source.episodes ?? null, source: "watchmode"
  };
}

export default async function handler(req, res) {
  try {
    const type = mediaType(req.query.type);
    const id = Number(req.query.id);
    const region = /^[A-Z]{2}$/.test(String(req.query.region || "")) ? req.query.region : "US";
    if (!Number.isInteger(id) || id <= 0) return send(res, 400, { error: "Invalid title ID" });

    const [details, availability] = await Promise.all([
      tmdb(`/${type}/${id}`, { language: "en-US", append_to_response: "external_ids" }),
      tmdb(`/${type}/${id}/watch/providers`)
    ]);
    const base = summary({ ...details, media_type: type });
    const regionOffers = availability.results?.[region] || {};
    const tmdbOffers = [];
    const seen = new Set();

    for (const [kind, items] of Object.entries({
      subscription: regionOffers.flatrate || [],
      ads: regionOffers.ads || [],
      free: regionOffers.free || [],
      rent: regionOffers.rent || [],
      buy: regionOffers.buy || []
    })) {
      for (const item of items) {
        const key = providerKey(item.provider_name);
        const unique = `${kind}-${item.provider_id}`;
        if (seen.has(unique)) continue;
        seen.add(unique);
        tmdbOffers.push({
          provider: key,
          providerId: item.provider_id,
          providerName: item.provider_name,
          providerLogo: item.logo_path ? `https://image.tmdb.org/t/p/w92${item.logo_path}` : null,
          kind,
          adfree: kind !== "ads",
          price: null,
          webUrl: regionOffers.link || null,
          source: "tmdb"
        });
      }
    }

    let watchmode = null;
    try { watchmode = await watchmodeSources(type, id, region); } catch { /* TMDB remains the fallback. */ }
    const offers = Array.isArray(watchmode) ? watchmode.map(source => normalizeWatchmode(source, tmdbOffers)) : [];
    for (const offer of tmdbOffers) {
      const duplicate = offers.some(item => item.kind === offer.kind && item.providerName?.toLowerCase() === offer.providerName?.toLowerCase());
      if (!duplicate) offers.push(offer);
    }

    const runtime = type === "tv"
      ? `${details.number_of_seasons || 0} season${details.number_of_seasons === 1 ? "" : "s"}`
      : details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : "Movie";
    const imdbId = details.imdb_id || details.external_ids?.imdb_id || null;
    let imdbRating = null;
    let imdbVotes = null;
    if (process.env.OMDB_API_KEY && imdbId) {
      try {
        const omdbUrl = new URL("https://www.omdbapi.com/");
        omdbUrl.searchParams.set("apikey", process.env.OMDB_API_KEY);
        omdbUrl.searchParams.set("i", imdbId);
        const omdbResponse = await fetch(omdbUrl);
        const omdb = await omdbResponse.json();
        if (omdb.Response !== "False" && omdb.imdbRating !== "N/A") {
          imdbRating = Number(omdb.imdbRating);
          imdbVotes = omdb.imdbVotes || null;
        }
      } catch { /* IMDb enrichment is optional; TMDB results still succeed. */ }
    }
    const result = {
      ...base,
      runtime,
      genres: (details.genres || []).map(genre => genre.name).slice(0, 3).join(" · ") || "Uncategorized",
      offers,
      imdbId,
      imdbRating,
      imdbVotes,
      providerLink: regionOffers.link || null,
      region,
      lastChecked: new Date().toISOString()
    };
    return send(res, 200, { result }, 604800);
  } catch (error) { return fail(res, error); }
}
