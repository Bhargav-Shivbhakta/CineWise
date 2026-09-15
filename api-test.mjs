import assert from "node:assert/strict";
import searchHandler from "./api/search.mjs";
import titleHandler from "./api/title.mjs";

process.env.TMDB_API_KEY = "test-key";
process.env.OMDB_API_KEY = "test-omdb-key";

global.fetch = async input => {
  const url = String(input);
  const json = value => ({ ok:true, status:200, json:async()=>value });
  if (url.includes("search/multi")) return json({ page:1, total_pages:1, results:[{
    id:1398, media_type:"tv", name:"The Sopranos", first_air_date:"1999-01-10",
    vote_average:8.7, overview:"A mob drama.", poster_path:"/poster.jpg", backdrop_path:"/backdrop.jpg"
  }]});
  if (url.includes("watch/providers")) return json({ results:{ US:{ link:"https://example.com/watch", flatrate:[{provider_id:1899,provider_name:"Max",logo_path:"/max.jpg"}] } } });
  if (url.includes("/tv/1398")) return json({ id:1398, name:"The Sopranos", first_air_date:"1999-01-10", vote_average:8.7, overview:"A mob drama.", number_of_seasons:6, genres:[{name:"Drama"},{name:"Crime"}], external_ids:{imdb_id:"tt0141842"} });
  if (url.includes("omdbapi.com")) return json({ Response:"True", imdbRating:"9.2", imdbVotes:"520,000" });
  throw new Error(`Unexpected request: ${url}`);
};

function response(){
  return { code:200, headers:{}, setHeader(k,v){this.headers[k]=v}, status(code){this.code=code;return this}, json(body){this.body=body;return this} };
}

const searchRes=response();
await searchHandler({query:{q:"The Sopranos"}},searchRes);
assert.equal(searchRes.code,200);
assert.equal(searchRes.body.results[0].title,"The Sopranos");
assert.equal(searchRes.body.results[0].type,"series");

const titleRes=response();
await titleHandler({query:{id:"1398",type:"tv",region:"US"}},titleRes);
assert.equal(titleRes.code,200);
assert.equal(titleRes.body.result.offers[0].provider,"max");
assert.equal(titleRes.body.result.imdbId,"tt0141842");
assert.equal(titleRes.body.result.imdbRating,9.2);
assert.equal(titleRes.body.result.runtime,"6 seasons");
console.log("All API tests passed: TMDB search, regional providers, and IMDb enrichment.");
