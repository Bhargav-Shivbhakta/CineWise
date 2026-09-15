import { tmdb, send, fail, summary } from "./_tmdb.mjs";

export default async function handler(req, res) {
  try {
    const data = await tmdb("/trending/all/day", { language: "en-US" });
    const results = data.results
      .filter(item => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, 12)
      .map(summary);
    return send(res, 200, { results }, true);
  } catch (error) { return fail(res, error); }
}
