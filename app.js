const PROVIDERS = {
  max: { name: "Max", short: "MAX", color: "#4f45e8", plans: { adfree: 18.49, ads: 10.99 } },
  hulu: { name: "Hulu", short: "HU", color: "#1ce783", plans: { adfree: 18.99, ads: 9.99 } },
  netflix: { name: "Netflix", short: "N", color: "#e50914", plans: { adfree: 17.99, ads: 7.99 } },
  apple: { name: "Apple TV+", short: "TV+", color: "#eff1f3", text: "#111", plans: { adfree: 12.99 } },
  prime: { name: "Prime Video", short: "PV", color: "#1399e8", plans: { adfree: 11.98, ads: 8.99 } },
  disney: { name: "Disney+", short: "D+", color: "#103b9b", plans: { adfree: 18.99, ads: 11.99 } },
  paramount: { name: "Paramount+", short: "P+", color: "#1264e3", plans: { adfree: 12.99, ads: 7.99 } },
  peacock: { name: "Peacock", short: "PE", color: "#111", plans: { adfree: 16.99, ads: 10.99 } }
};

const TITLES = [
  { id: 1, title: "The Sopranos", type: "series", year: 1999, rating: 8.7, runtime: "6 seasons", genres: "Drama · Crime", match: 98, colors:["#84745f","#211d1a"], synopsis:"New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life, seeking help from a therapist.", offers:[sub("max"), buy("apple",99.99)] },
  { id: 2, title: "Severance", type: "series", year: 2022, rating: 8.7, runtime: "2 seasons", genres: "Drama · Mystery", match: 96, colors:["#77968d","#172320"], synopsis:"Office workers whose memories have been surgically divided uncover a mystery at the heart of their company.", offers:[sub("apple")] },
  { id: 3, title: "Dune: Part Two", type: "movie", year: 2024, rating: 8.5, runtime: "2h 46m", genres: "Sci-Fi · Adventure", match: 94, colors:["#d27c43","#322017"], synopsis:"Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.", offers:[sub("max"), rent("prime",3.99), rent("apple",4.99)] },
  { id: 4, title: "Shōgun", type: "series", year: 2024, rating: 8.6, runtime: "1 season", genres: "Drama · History", match: 93, colors:["#b12722","#23100f"], synopsis:"In Japan in 1600, Lord Yoshii Toranaga fights for his life as his enemies unite against him.", offers:[sub("hulu"), buy("apple",19.99)] },
  { id: 5, title: "The Bear", type: "series", year: 2022, rating: 8.5, runtime: "4 seasons", genres: "Drama · Comedy", match: 92, colors:["#3b7bb5","#101c26"], synopsis:"A young chef from fine dining returns to Chicago to run his family's sandwich shop after a heartbreaking death.", offers:[sub("hulu"), buy("prime",19.99)] },
  { id: 6, title: "Oppenheimer", type: "movie", year: 2023, rating: 8.1, runtime: "3h 1m", genres: "Drama · History", match: 91, colors:["#dd6b2f","#17100c"], synopsis:"The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.", offers:[sub("prime"), rent("apple",5.99), rent("peacock",4.99)] },
  { id: 7, title: "Stranger Things", type: "series", year: 2016, rating: 8.6, runtime: "4 seasons", genres: "Sci-Fi · Horror", match: 89, colors:["#bc1f2a","#160b0e"], synopsis:"When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.", offers:[sub("netflix")] },
  { id: 8, title: "The Last of Us", type: "series", year: 2023, rating: 8.7, runtime: "2 seasons", genres: "Drama · Adventure", match: 88, colors:["#5b6c46","#181b14"], synopsis:"A hardened survivor escorts a teenage girl across a post-apocalyptic United States.", offers:[sub("max"), buy("apple",24.99)] },
  { id: 9, title: "Everything Everywhere All at Once", type: "movie", year: 2022, rating: 7.7, runtime: "2h 20m", genres: "Comedy · Sci-Fi", match: 87, colors:["#9b55bc","#1b1020"], synopsis:"An overwhelmed immigrant mother must connect with parallel-universe versions of herself to stop reality from unraveling.", offers:[sub("paramount"), rent("prime",3.99), rent("apple",3.99)] },
  { id: 10, title: "Succession", type: "series", year: 2018, rating: 8.9, runtime: "4 seasons", genres: "Drama · Comedy", match: 95, colors:["#96744d","#1c1611"], synopsis:"The Roy family wrestles for control of their global media empire amid uncertainty about the patriarch's health.", offers:[sub("max"), buy("prime",28.99)] },
  { id: 11, title: "Ted Lasso", type: "series", year: 2020, rating: 8.8, runtime: "3 seasons", genres: "Comedy · Sport", match: 90, colors:["#dfbc45","#203b59"], synopsis:"An optimistic American football coach is hired to manage a struggling English soccer team.", offers:[sub("apple")] },
  { id: 12, title: "The Godfather", type: "movie", year: 1972, rating: 9.2, runtime: "2h 55m", genres: "Crime · Drama", match: 97, colors:["#8f352e","#160d0c"], synopsis:"The aging patriarch of an organized crime dynasty transfers control to his reluctant son.", offers:[sub("paramount"), rent("prime",3.99), rent("apple",3.99)] }
];

function sub(provider, adfree=true){ return { provider, kind:"subscription", adfree }; }
function rent(provider, price){ return { provider, kind:"rent", price, adfree:true }; }
function buy(provider, price){ return { provider, kind:"buy", price, adfree:true }; }

const REGIONS = { US:["🇺🇸","United States","$"], IN:["🇮🇳","India","₹"], GB:["🇬🇧","United Kingdom","£"], CA:["🇨🇦","Canada","CA$"], AU:["🇦🇺","Australia","A$"] };
const monthOptions = Array.from({length:6},(_,i)=>{ const d=new Date(); d.setMonth(d.getMonth()+i); return { key:`${d.getFullYear()}-${d.getMonth()}`, label:d.toLocaleDateString("en-US",{month:"long",year:"numeric"}) }; });
const state = {
  view:"discover", filter:"all", query:"", region:localStorage.getItem("cw-region")||"US",
  watchlist:JSON.parse(localStorage.getItem("cw-watchlist")||"[]"), activeMonth:monthOptions[0].key,
  optimizerMonth:monthOptions[0].key, mode:"adfree", owned:JSON.parse(localStorage.getItem("cw-owned")||"[]")
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function persist(){ localStorage.setItem("cw-watchlist",JSON.stringify(state.watchlist)); localStorage.setItem("cw-owned",JSON.stringify(state.owned)); }
function providerLogo(key,large=false){ const p=PROVIDERS[key]; return `<span class="${large?'big-logo':'provider-logo'}" style="background:${p.color};color:${p.text||'#fff'}">${p.short}</span>`; }
function initials(title){ return title.split(/\s+/).filter(w=>!['the','a','at','of'].includes(w.toLowerCase())).slice(0,2).map(w=>w[0]).join(""); }
function isAdded(id){ return state.watchlist.some(x=>x.id===id); }
function planPrice(provider,mode){ const plans=PROVIDERS[provider].plans; return mode==="overall"?(plans.ads??plans.adfree):plans.adfree; }
function offerCost(o,mode=state.mode){ if(o.kind==="subscription") return planPrice(o.provider,mode) ?? Infinity; return o.price; }
function bestOffer(t,mode="adfree"){
  const valid=t.offers.filter(o=>mode!=="adfree"||o.adfree!==false).sort((a,b)=>offerCost(a,mode)-offerCost(b,mode)); return valid[0];
}
function formatCost(n){ return n===0?"Included":`$${n.toFixed(2)}`; }

function renderCards(){
  const query=state.query.trim().toLowerCase();
  const rows=TITLES.filter(t=>(state.filter==="all"||t.type===state.filter)&&(!query||`${t.title} ${t.genres} ${t.year}`.toLowerCase().includes(query)));
  $("#resultKicker").textContent=query?`${rows.length} MATCH${rows.length===1?'':'ES'} FOUND`:"CURATED FOR TONIGHT";
  $("#resultTitle").textContent=query?`Results for “${state.query.trim()}”`:"Popular right now";
  $("#resultsGrid").innerHTML=rows.length?rows.map(t=>{
    const best=bestOffer(t), provider=PROVIDERS[best.provider];
    return `<article class="title-card" data-id="${t.id}">
      <div class="poster" style="--poster-a:${t.colors[0]};--poster-b:${t.colors[1]}">
        <span class="match-badge">${t.match}% MATCH</span><button class="quick-add ${isAdded(t.id)?'added':''}" data-add="${t.id}" aria-label="${isAdded(t.id)?'Remove from':'Add to'} plan">${isAdded(t.id)?'✓':'+'}</button>
        <div class="poster-art">${initials(t.title)}</div><div class="poster-copy"><small>${t.type}</small><strong>${t.title}</strong></div>
      </div><div class="card-info"><h3>${t.title}</h3><div class="meta"><span>${t.year}</span><span>•</span><span>★ ${t.rating}</span><span>•</span><span>${t.runtime}</span></div>
      <div class="availability"><div class="provider-stack">${[...new Set(t.offers.map(o=>o.provider))].slice(0,3).map(p=>providerLogo(p)).join("")}</div><span class="from-price">best <strong>${best.kind==='subscription'?provider.name:formatCost(best.price)}</strong></span></div></div>
    </article>`;
  }).join(""):`<div class="empty-state"><h3>No titles found</h3><p>Try a different title, actor, genre, or year.</p></div>`;
}

function addTitle(id){
  const existing=state.watchlist.find(x=>x.id===id);
  if(existing){ state.watchlist=state.watchlist.filter(x=>x.id!==id); toast("Removed from your plan"); }
  else { state.watchlist.push({id,month:state.activeMonth}); toast("Added — cheapest plan recalculated"); }
  persist(); updateCount(); renderCards(); if(state.view==="plan")renderPlan(); if(state.view==="optimizer")renderOptimizer();
}
function updateCount(){ $("#planCount").textContent=state.watchlist.length; }

function setView(view){
  state.view=view; $$(".view").forEach(v=>v.classList.remove("active")); $(`#${view}View`).classList.add("active");
  $$(".nav-link").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  if(view==="plan")renderPlan(); if(view==="optimizer")renderOptimizer(); window.scrollTo({top:0,behavior:"smooth"});
}

function renderMonthControls(){
  $("#monthTabs").innerHTML=monthOptions.map(m=>`<button class="month-tab ${m.key===state.activeMonth?'active':''}" data-month="${m.key}">${m.label.split(' ')[0]} <small>${state.watchlist.filter(x=>x.month===m.key).length}</small></button>`).join("");
  const options=monthOptions.map(m=>`<option value="${m.key}">${m.label}</option>`).join("");
  $("#optimizerMonth").innerHTML=options; $("#optimizerMonth").value=state.optimizerMonth;
}
function renderPlan(){
  renderMonthControls(); const entries=state.watchlist.filter(x=>x.month===state.activeMonth); const titles=entries.map(e=>TITLES.find(t=>t.id===e.id)).filter(Boolean); const rec=optimize(titles,"adfree",state.owned);
  $("#planSummary").innerHTML=`<div class="summary-card accent"><span>Recommended subscriptions</span><strong>${rec.providers.length?rec.providers.map(p=>PROVIDERS[p].name).join(' + '):'No subscription needed'}</strong></div><div class="summary-card"><span>Titles this month</span><strong>${titles.length}</strong></div><div class="summary-card"><span>Estimated cost</span><strong>${formatCost(rec.total)}</strong></div>`;
  $("#watchlist").innerHTML=entries.length?entries.map(e=>{ const t=TITLES.find(x=>x.id===e.id), b=bestOffer(t), p=PROVIDERS[b.provider]; return `<div class="watch-row"><div class="mini-poster" style="--poster-a:${t.colors[0]};--poster-b:${t.colors[1]}">${initials(t.title)}</div><div class="watch-title"><strong>${t.title}</strong><small>${t.year} · ${t.type}</small></div><select data-move="${t.id}" aria-label="Move ${t.title} to month">${monthOptions.map(m=>`<option value="${m.key}" ${e.month===m.key?'selected':''}>${m.label}</option>`).join('')}</select><div class="best-option"><span>Cheapest ad-free</span><strong>${p.name} · ${b.kind==='subscription'?formatCost(p.plans.adfree)+'/mo':formatCost(b.price)}</strong></div><button class="remove-btn" data-remove="${t.id}" aria-label="Remove ${t.title}">×</button></div>`; }).join(''):`<div class="empty-state"><h3>Nothing planned for this month</h3><p>Discover a title and use + to add it. You can move it here from another month too.</p><button class="primary-btn" data-view-jump="discover">Find something to watch</button></div>`;
}

function optimize(titles,mode,owned){
  if(!titles.length)return {providers:[],total:0,covered:[],uncovered:[]};
  const providerKeys=[...new Set(titles.flatMap(t=>t.offers.filter(o=>o.kind==='subscription'&&(mode!=='adfree'||PROVIDERS[o.provider].plans.adfree!=null)).map(o=>o.provider)))];
  let best=null;
  for(let mask=0;mask<(1<<providerKeys.length);mask++){
    const selected=providerKeys.filter((_,i)=>mask&(1<<i));
    const covered=titles.filter(t=>t.offers.some(o=>o.kind==='subscription'&&selected.includes(o.provider)));
    const monthly=selected.reduce((sum,p)=>sum+(owned.includes(p)?0:(planPrice(p,mode)??Infinity)),0);
    const rentals=titles.filter(t=>!covered.includes(t)).map(t=>({title:t,offer:t.offers.filter(o=>o.kind!=="subscription").sort((a,b)=>a.price-b.price)[0]}));
    const total=Math.round((monthly+rentals.reduce((s,r)=>s+(r.offer?.price??999),0))*100)/100;
    if(!best||total<best.total||(total===best.total&&selected.length<best.providers.length)) best={providers:selected,total,covered,rentals};
  }
  return {...best,uncovered:best.rentals.filter(r=>!r.offer)};
}

function renderOwned(){
  $("#ownedServices").innerHTML=Object.entries(PROVIDERS).map(([key,p])=>`<label class="service-check"><span>${providerLogo(key)} ${p.name}</span><input type="checkbox" data-owned="${key}" ${state.owned.includes(key)?'checked':''}></label>`).join('');
}
function renderOptimizer(){
  renderMonthControls(); renderOwned(); const entries=state.watchlist.filter(x=>x.month===state.optimizerMonth); const titles=entries.map(e=>TITLES.find(t=>t.id===e.id)).filter(Boolean); const rec=optimize(titles,state.mode,state.owned); const budget=Number($("#budgetInput").value)||0; const covered=titles.length-rec.uncovered.length; const pct=titles.length?Math.round(covered/titles.length*100):0;
  $("#optimizationResult").innerHTML=titles.length?`<div class="rec-header"><div><span class="section-kicker">BEST VALUE COMBINATION</span><h2>Your recommended plan</h2><p>Calculated from ${Math.pow(2,[...new Set(titles.flatMap(t=>t.offers.map(o=>o.provider)))].length)} possible provider combinations.</p></div><div class="total-cost"><small>Estimated total</small><strong>${formatCost(rec.total)}</strong><span>for this month</span></div></div>
  <div class="coverage-bar"><div class="coverage-label"><span>Plan coverage</span><strong>${covered} of ${titles.length} titles</strong></div><div class="bar"><i style="width:${pct}%"></i></div></div>
  <div class="recommendation-list">${rec.providers.map(key=>{ const p=PROVIDERS[key], count=titles.filter(t=>t.offers.some(o=>o.kind==='subscription'&&o.provider===key)).length, free=state.owned.includes(key); return `<div class="provider-rec">${providerLogo(key,true)}<div><h3>${p.name} — ${state.mode==='adfree'?'Ad-free':'Lowest-price'} plan</h3><p>Covers ${count} title${count===1?'':'s'} in your ${monthOptions.find(m=>m.key===state.optimizerMonth).label} list${free?' · Already owned':''}</p></div><div class="provider-cost">${free?'$0.00':formatCost(planPrice(key,state.mode))}<small>${free?'owned':'per month'}</small></div></div>`}).join('')}${rec.rentals.map(r=>r.offer?`<div class="provider-rec">${providerLogo(r.offer.provider,true)}<div><h3>Rent ${r.title.title}</h3><p>No selected subscription covers this title more cheaply</p></div><div class="provider-cost">${formatCost(r.offer.price)}<small>one-time</small></div></div>`:'').join('')}</div>
  <div class="explanation ${rec.total>budget?'over-budget':''}">${rec.total<=budget?`✓ This plan is within your $${budget.toFixed(0)} budget by $${(budget-rec.total).toFixed(2)}.`:`This plan is $${(rec.total-budget).toFixed(2)} over your budget. Move one or more titles to another month to reduce the total.`} Cinewise recommends cancelling unneeded services at the end of the month.</div>`:
  `<div class="empty-state"><h3>Your optimizer is ready</h3><p>Add titles to ${monthOptions.find(m=>m.key===state.optimizerMonth).label} and the cheapest provider combination will appear here.</p><button class="primary-btn" data-view-jump="discover">Discover titles</button></div>`;
}

function openDetail(id){
  const t=TITLES.find(x=>x.id===id); if(!t)return; const best=bestOffer(t); const month=monthOptions.find(m=>m.key===state.activeMonth);
  $("#detailContent").innerHTML=`<div class="detail-hero" style="--poster-a:${t.colors[0]};--poster-b:${t.colors[1]}"><div><span class="section-kicker">${t.match}% MATCH · ${t.type.toUpperCase()}</span><h2 id="detailTitle">${t.title}</h2><div class="meta"><span>${t.year}</span><span>•</span><span>★ ${t.rating}</span><span>•</span><span>${t.runtime}</span><span>•</span><span>${t.genres}</span></div><p>${t.synopsis}</p></div></div><div class="detail-body"><h3>Where to watch in ${REGIONS[state.region][1]}</h3><div class="offer-list">${t.offers.map((o,i)=>{const p=PROVIDERS[o.provider],cost=o.kind==='subscription'?p.plans.adfree:o.price;return `<div class="offer">${providerLogo(o.provider,true)}<div><strong>${p.name}</strong><div class="offer-type">${o.kind}${o.kind==='subscription'?' · ad-free plan':''}${i===0?' · recommended':''}</div></div><span class="offer-price">${formatCost(cost)}${o.kind==='subscription'?'/mo':''}</span><button>View offer ↗</button></div>`}).join('')}</div><button class="primary-btn add-plan-btn" data-add="${t.id}">${isAdded(t.id)?'Remove from plan':`Add to ${month.label} plan`} →</button></div>`;
  $("#detailModal").classList.add("open"); $("#detailModal").setAttribute("aria-hidden","false");
}
function closeDetail(){ $("#detailModal").classList.remove("open"); $("#detailModal").setAttribute("aria-hidden","true"); }
function toast(msg){ const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove("show"),2200); }
function updateRegion(){ const r=REGIONS[state.region]; $("#regionFlag").textContent=r[0]; $("#heroRegion").textContent=r[1]; $("#regionPicker").value=state.region; localStorage.setItem("cw-region",state.region); renderCards(); }

document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-view]"); if(nav)return setView(nav.dataset.view);
  const jump=e.target.closest("[data-view-jump]"); if(jump)return setView(jump.dataset.viewJump);
  const add=e.target.closest("[data-add]"); if(add){ e.stopPropagation(); addTitle(Number(add.dataset.add)); if(add.closest('.detail-modal'))closeDetail(); return; }
  const card=e.target.closest(".title-card"); if(card)return openDetail(Number(card.dataset.id));
  const filter=e.target.closest("[data-filter]"); if(filter){ state.filter=filter.dataset.filter; $$("[data-filter]").forEach(b=>b.classList.toggle("active",b===filter)); return renderCards(); }
  const month=e.target.closest("[data-month]"); if(month){ state.activeMonth=month.dataset.month; return renderPlan(); }
  const remove=e.target.closest("[data-remove]"); if(remove)return addTitle(Number(remove.dataset.remove));
  const mode=e.target.closest("[data-mode]"); if(mode){ state.mode=mode.dataset.mode; $$("[data-mode]").forEach(b=>b.classList.toggle("active",b===mode)); return renderOptimizer(); }
  if(e.target.id==="detailModal"||e.target.closest(".modal-close"))closeDetail();
});
document.addEventListener("change",e=>{
  if(e.target.matches("[data-move]")){ const entry=state.watchlist.find(x=>x.id===Number(e.target.dataset.move)); entry.month=e.target.value; persist(); toast("Title moved — plan recalculated"); renderPlan(); }
  if(e.target.matches("[data-owned]")){ const key=e.target.dataset.owned; state.owned=e.target.checked?[...new Set([...state.owned,key])]:state.owned.filter(x=>x!==key); persist(); renderOptimizer(); }
});
$("#searchInput").addEventListener("input",e=>{state.query=e.target.value;renderCards();});
$("#regionPicker").addEventListener("change",e=>{state.region=e.target.value;updateRegion();toast(`Region changed to ${REGIONS[state.region][1]}`);});
$("#optimizerMonth").addEventListener("change",e=>{state.optimizerMonth=e.target.value;renderOptimizer();});
$("#budgetInput").addEventListener("input",renderOptimizer);
document.addEventListener("keydown",e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setView("discover");$("#searchInput").focus();} if(e.key==="Escape")closeDetail(); });

updateCount(); updateRegion(); renderCards(); renderMonthControls();
