const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");

class Element {
  constructor(){ this.innerHTML=""; this.textContent=""; this.value="35"; this.dataset={}; this.classList={add(){},remove(){},toggle(){}}; }
  addEventListener(){}
  setAttribute(){}
  closest(){ return null; }
  focus(){}
}
const elements = new Map();
const document = {
  querySelector(selector){ if(!elements.has(selector)) elements.set(selector,new Element()); return elements.get(selector); },
  querySelectorAll(){ return []; },
  addEventListener(){}
};
const localStorage = { getItem(){return null;}, setItem(){} };
const sandbox = { document, localStorage, console, setTimeout, clearTimeout, Date, Math, JSON, window:{scrollTo(){}} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("app.js","utf8"),sandbox);

const results = vm.runInContext(`(() => {
  const sopranos = DEMO_TITLES.find(t => t.title === "The Sopranos");
  const succession = DEMO_TITLES.find(t => t.title === "Succession");
  const severance = DEMO_TITLES.find(t => t.title === "Severance");
  return {
    search: DEMO_TITLES.filter(t => t.title.toLowerCase().includes("sopranos")).length,
    maxBundle: optimize([sopranos, succession], "adfree", []),
    mixedBundle: optimize([sopranos, severance], "adfree", []),
    ownedBundle: optimize([sopranos, succession], "adfree", ["max"]),
    adsBundle: optimize([sopranos, succession], "overall", [])
  };
})()`, sandbox);

assert.equal(results.search, 1, "The Sopranos must be searchable");
assert.deepEqual([...results.maxBundle.providers], ["max"]);
assert.equal(results.maxBundle.total, 18.49);
assert.deepEqual([...results.mixedBundle.providers].sort(), ["apple","max"]);
assert.equal(results.mixedBundle.total, 31.48);
assert.equal(results.ownedBundle.total, 0);
assert.equal(results.adsBundle.total, 10.99);
const watchedResult = vm.runInContext(`(() => {
  const title = DEMO_TITLES[0];
  state.watchlist = [{ id:title.id, month:state.activeMonth, title }];
  state.recommendations = [title];
  applyWatched(title);
  return { watched:state.watched.length, planned:state.watchlist.length, remaining:recommendationRows().length };
})()`, sandbox);
assert.equal(watchedResult.watched,1);
assert.equal(watchedResult.planned,0);
assert.equal(watchedResult.remaining,0);
console.log("All core tests passed: optimization, owned services, watched history, and queue removal.");
