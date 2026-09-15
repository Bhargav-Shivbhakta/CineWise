import assert from "node:assert/strict";
import searchHandler from "./api/search.mjs";
import titleHandler from "./api/title.mjs";
import recommendationsHandler from "./api/recommendations.mjs";

process.env.TMDB_API_KEY = "test-key";
process.env.OMDB_API_KEY = "test-omdb-key";
process.env.WATCHMODE_API_KEY = "test-watchmode-key";

global.fetch = async input => {
  const url = String(input);
  const json = value => ({ ok:true, status:200, json:async()=>value });
  if (url.includes("search/multi")) return json({ page:1, total_pages:1, results:[{
    id:1398, media_type:"tv", name:"The Sopranos", first_air_date:"1999-01-10",
    vote_average:8.7, overview:"A mob drama.", poster_path:"/poster.jpg", backdrop_path:"/backdrop.jpg"
  }]});
  if (url.includes("discover/movie")) return json({ results:[{ id:550, title:"Fight Club", release_date:"1999-10-15", vote_average:8.4, overview:"An insomniac meets a soap maker." }] });
  if (url.includes("discover/tv")) return json({ results:[{ id:1398, name:"The Sopranos", first_air_date:"1999-01-10", vote_average:8.7, overview:"A mob drama." }] });
  if (url.includes("watch/providers")) return json({ results:{ US:{ link:"https://example.com/watch", flatrate:[{provider_id:1899,provider_name:"Max",logo_path:"/max.jpg"}] } } });
  if (url.includes("/tv/1398")) return json({ id:1398, name:"The Sopranos", first_air_date:"1999-01-10", vote_average:8.7, overview:"A mob drama.", number_of_seasons:6, genres:[{name:"Drama"},{name:"Crime"}], external_ids:{imdb_id:"tt0141842"} });
  if (url.includes("api.watchmode.com")) return json([
    { source_id:203, name:"Max", type:"sub", region:"US", web_url:"https://play.max.com/sopranos", format:"HD", price:null, seasons:6, episodes:86 },
    { source_id:307, name:"Spectrum On Demand", type:"tve", region:"US", web_url:"https://spectrum.example/sopranos", format:"HD", price:null }
  ]);
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
assert.equal(titleRes.body.result.offers[0].webUrl,"https://play.max.com/sopranos");
assert.equal(titleRes.body.result.offers[1].providerName,"Spectrum On Demand");
assert.equal(titleRes.body.result.imdbId,"tt0141842");
assert.equal(titleRes.body.result.imdbRating,9.2);
assert.equal(titleRes.body.result.runtime,"6 seasons");

const recommendationsRes=response();
await recommendationsHandler({query:{providers:"max,netflix",region:"US"}},recommendationsRes);
assert.equal(recommendationsRes.code,200);
assert.equal(recommendationsRes.body.results.length,2);
assert.deepEqual(recommendationsRes.body.results.find(item=>item.title==="The Sopranos").offers.map(offer=>offer.provider),["max","netflix"]);
console.log("All API tests passed: search, Watchmode offers, provider recommendations, and IMDb enrichment.");
