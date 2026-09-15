const API_ROOT = "https://api.themoviedb.org/3";

export async function tmdb(path, params = {}) {
  const token = process.env.TMDB_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    const error = new Error("TMDB credentials are not configured");
    error.status = 503;
    throw error;
  }

  const url = new URL(`${API_ROOT}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  if (!token) url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" }
  });
  if (!response.ok) {
    const error = new Error(`TMDB request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function send(res, status, body, cache = false) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (cache) res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  return res.status(status).json(body);
}

export function fail(res, error) {
  const status = Number(error.status) || 500;
  return send(res, status, { error: status === 500 ? "Unable to retrieve catalog data" : error.message });
}

export function mediaType(value) {
  return value === "tv" || value === "series" ? "tv" : "movie";
}

export function summary(item) {
  const type = mediaType(item.media_type);
  const date = type === "tv" ? item.first_air_date : item.release_date;
  return {
    id: `tmdb-${type}-${item.id}`,
    tmdbId: item.id,
    type: type === "tv" ? "series" : "movie",
    title: type === "tv" ? item.name : item.title,
    originalTitle: type === "tv" ? item.original_name : item.original_title,
    year: date ? Number(date.slice(0, 4)) : null,
    rating: Number(item.vote_average || 0).toFixed(1),
    runtime: type === "tv" ? "TV series" : "Movie",
    genres: "Live catalog",
    match: Math.max(60, Math.min(99, Math.round(68 + Number(item.vote_average || 0) * 3))),
    colors: ["#35435a", "#10151d"],
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
    synopsis: item.overview || "No synopsis is currently available.",
    offers: [],
    live: true
  };
}

const PROVIDER_KEYS = [
  [/max|hbo/i, "max"], [/hulu/i, "hulu"], [/netflix/i, "netflix"],
  [/apple/i, "apple"], [/amazon|prime/i, "prime"], [/disney/i, "disney"],
  [/paramount/i, "paramount"], [/peacock/i, "peacock"]
];

export function providerKey(name) {
  return PROVIDER_KEYS.find(([pattern]) => pattern.test(name))?.[1] || null;
}
