import { tmdb, send, fail, summary } from "./_tmdb.mjs";

export default async function handler(req, res) {
  try {
    const query = String(req.query.q || "").trim().slice(0, 100);
    if (query.length < 2) return send(res, 400, { error: "Enter at least two characters" });
    const data = await tmdb("/search/multi", {
      query,
      include_adult: false,
      language: "en-US",
      page: Math.max(1, Math.min(20, Number(req.query.page) || 1))
    });
    const results = data.results
      .filter(item => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, 20)
      .map(summary);
    return send(res, 200, { results, page: data.page, totalPages: data.total_pages }, true);
  } catch (error) { return fail(res, error); }
}
