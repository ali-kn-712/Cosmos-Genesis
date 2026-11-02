// Cosmos Genesis — UI. Reads ONLY from services/dataService.js and config/site.config.js.
import { api } from "./services/dataService.js";
import { auth } from "./services/authService.js";
import { adminArticles } from "./services/adminArticleService.js";
import { adminEvents } from "./services/adminEventService.js";
import { mountAdminCrud } from "./admin/adminCrudView.js";
import { site } from "../config/site.config.js";
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app"), ov = $("#overlay"), nv = $("#nav");
try { document.documentElement.dataset.theme = localStorage.getItem("theme") || "dark"; } catch {}
document.title = site.brand.name; $("#fav").href = site.logos.favicon;
const th = () => document.documentElement.dataset.theme, logo = () => site.logos[th()] || site.logos.main;
const heroLogo = site.logos.dark || site.logos.main;
const hue = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 360;
const img = (src, seed) => src || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'><defs><radialGradient id='g' cx='.3' cy='.4'><stop offset='0' stop-color='hsl(${hue(seed)},55%,30%)'/><stop offset='1' stop-color='#05070b'/></radialGradient></defs><rect width='400' height='300' fill='url(#g)'/><g fill='#fff' opacity='.7'>${[...Array(25)].map((_, i) => `<circle cx='${(hue(seed + i) * 7 + i * 53) % 400}' cy='${(hue(seed + i * 3) * 5 + i * 29) % 300}' r='${i % 4 ? .7 : 1.3}'/>`).join("")}</g></svg>`)}`;
let tz = "UTC";
const dt = (iso, z, p) => { if (!iso) return "TBD"; const o = p === "d" ? { dateStyle: "medium" } : p === "t" ? { timeStyle: "short", hourCycle: "h23" } : { dateStyle: "medium", timeStyle: "short", hourCycle: "h23" }; if (z === "UTC") o.timeZone = "UTC"; return new Intl.DateTimeFormat("en-GB", o).format(new Date(iso)) + (p !== "d" && z === "UTC" ? " UTC" : ""); };
const cd = iso => { if (!iso) return "TBD"; const s = Math.floor((new Date(iso) - Date.now()) / 1000); if (s <= 0) return "Launched"; const q = n => String(n).padStart(2, "0"); return `${Math.floor(s / 86400)}d ${q(Math.floor(s % 86400 / 3600))}h ${q(Math.floor(s % 3600 / 60))}m ${q(s % 60)}s`; };
setInterval(() => $$("[data-cd]").forEach(e => e.textContent = cd(e.dataset.cd || null)), 1000);
const refreshDt = () => { $$("[data-dt]").forEach(e => e.textContent = dt(e.dataset.dt || null, tz, e.dataset.p)); $$("[data-tz]").forEach(b => b.classList.toggle("on", b.dataset.tz === tz)); };
const dl = o => `<dl>${Object.entries(o).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
const card = (a, big) => `<a class="card${big ? " big" : ""}" href="#/articles/${a.slug}"><img loading="lazy" src="${img(a.image, a.slug)}" alt=""><div><small>${a.category} · ${dt(a.date + "T00:00:00Z", "UTC", "d")} · ${a.readMin} min</small><h3>${a.title}</h3><p>${a.description}</p></div></a>`;
const toast = m => { const t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2500); };
const closeOv = () => { ov.className = "ov"; ov.innerHTML = ""; document.body.style.overflow = ""; document.onkeydown = null; };

// ---------- NAV (hidden on load, shows on scroll-up, auto-hides 3s after scrolling stops) ----------
nv.innerHTML = `<nav aria-label="Main">${site.nav.map(n => `<a href="${n.href}">${n.label}</a>`).join("")}</nav><span class="sp"></span><button id="tb" aria-label="Toggle light/dark mode">◐</button><button id="sb" aria-label="Search">⌕</button>`;
let last = scrollY, tmr;
addEventListener("scroll", () => { const y = scrollY; clearTimeout(tmr); if (y < last) nv.classList.remove("hide"); else if (y > last) nv.classList.add("hide"); last = y; if (!nv.classList.contains("hide")) tmr = setTimeout(() => nv.classList.add("hide"), 3000); $("#top").classList.toggle("on", y > 600); }, { passive: true });
nv.addEventListener("focusin", () => nv.classList.remove("hide"));
$("#top").onclick = () => scrollTo({ top: 0, behavior: "smooth" });
$("#tb").onclick = () => { const t = th() === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = t; try { localStorage.setItem("theme", t); } catch {} $$("[data-logo]").forEach(i => i.src = logo()); };
$("#sb").onclick = () => search();
$("#foot").innerHTML = `<div class="wrap fgrid"><div><img data-logo src="${logo()}" alt="${site.brand.name}"><p class="mut">${site.footer.text}</p></div><div><h4>Contact</h4><a href="mailto:${site.contact.email}">${site.contact.email}</a><p class="mut">${site.contact.location}</p></div><div><h4>Follow</h4>${site.social.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a><br>`).join("")}</div><div><h4>Explore</h4>${site.footer.links.map(l => `<a href="${l.href}">${l.label}</a><br>`).join("")}</div></div><p class="wrap copy">${site.footer.copyright}</p>`;

// ---------- HOME ----------
async function home() {
  const [h, m, arts, gal] = await Promise.all([api.home(), api.featuredMission(), api.articles(), api.gallery()]);
  let feat = h.featuredArticleSlugs.map(s => arts.find(a => a.slug === s)).filter(Boolean); if (!feat.length) feat = arts.slice(0, 3);
  const gi = h.galleryIds.map(id => gal.find(g => g.id === id)).filter(Boolean);
  app.innerHTML = `<section class="hero full"${h.heroPoster ? ` style="--poster:url('${h.heroPoster}')"` : ""}>${h.heroVideo ? `<video autoplay muted loop playsinline src="${h.heroVideo}"></video>` : ""}<div class="hc"><img class="hlogo" src="${heroLogo}" alt="${site.brand.name}"><p class="slogan">${site.brand.slogan}</p><a class="btn" href="${site.cta.explore}" style="color:#fff;border-color:#fff">Explore</a></div><div class="scroll">↓<br>Scroll</div></section>
  <section class="sec"><div class="wrap split"><img src="${img(m.image, m.id)}" alt="${m.name}"><div><p class="eyebrow">Next spaceflight</p><h2>${m.name}</h2><div class="cd" data-cd="${m.net || ""}">${cd(m.net)}</div>${dl({ Launch: `<span data-dt="${m.net || ""}">${dt(m.net, tz)}</span>`, Rocket: m.rocket, Company: m.company, Location: `${m.site}, ${m.state}, ${m.country}` })}<a class="btn" href="#/spaceflight">View mission</a> <a class="btn ghost" href="${site.cta.moreFlights}">More spaceflights</a></div></div></section>
  <section class="sec wrap"><div class="hd"><h2>Latest articles</h2><a class="btn ghost" href="${site.cta.moreArticles}">More articles</a></div><div class="grid3">${feat.map(a => card(a)).join("")}</div></section>
  <section class="sec wrap"><div class="hd"><h2>Gallery</h2><a class="btn ghost" href="${site.cta.moreImages}">More images</a></div><div class="gstrip">${gi.map(g => `<a href="#/gallery"><img loading="lazy" src="${img(g.thumb || g.src, g.id)}" alt="${g.title}"></a>`).join("")}</div></section>`;
}

// ---------- ARTICLES ----------
async function articles() {
  const [arts, h] = await Promise.all([api.articles(), api.home()]);
  if (!arts.length) { app.innerHTML = `<p class="empty pt">No articles published yet.</p>`; return; }
  const f = arts.find(a => a.slug === h.archiveFeaturedSlug) || arts[0];
  app.innerHTML = `<section class="wrap pt"><h1>Articles</h1><div style="height:2rem"></div>${card(f, true)}<div class="grid3">${arts.filter(a => a !== f).map(a => card(a)).join("")}</div></section>`;
}
async function article(slug) {
  const [a, all] = await Promise.all([api.article(slug), api.articles()]);
  if (!a) { app.innerHTML = `<p class="empty pt">Article not found.</p>`; return; }
  const seq = [];
  const med = (it, k) => { const i = seq.push({ kind: it.kind, src: it.src, thumb: it.poster, alt: it.alt, title: it.caption || it.alt || a.title, meta: a.title, id: a.slug + k }) - 1;
    return `<figure><button class="mb" data-m="${i}" aria-label="Open ${it.kind}"><img loading="lazy" src="${img(it.kind === "image" ? it.src : it.poster, a.slug + k)}" alt="${it.alt || ""}" style="aspect-ratio:${it.ratio || "16/9"};object-fit:cover;width:100%">${it.kind === "video" ? '<span class="play">▶</span>' : ""}</button>${it.caption ? `<figcaption>${it.caption}</figcaption>` : ""}</figure>`; };
  const blk = (b, k) => b.type === "text" ? `<div class="wrap narrow prose">${b.html}</div>`
    : b.type === "media" ? `<div class="wrap mrow ${b.layout === "media-right" ? "r" : ""}"><div class="md">${b.items.map((it, j) => med(it, k + "-" + j)).join("")}</div><div class="prose">${b.html}</div></div>`
    : b.type === "wide" ? `<div class="wide">${med(b.item, "w" + k)}</div>`
    : b.type === "quote" ? `<blockquote class="wrap narrow">${b.text}<cite>${b.cite || ""}</cite></blockquote>` : "";
  const body = a.blocks.map(blk).join(""), rel = all.filter(x => x.slug !== slug); let ri = 0;
  const x = 1 + Math.random() * 8 | 0, y = 1 + Math.random() * 8 | 0;
  app.innerHTML = `<section class="ahero"><img src="${img(a.image, a.slug)}" alt="${a.title}"><div class="at"><p class="eyebrow">${a.category}</p><h1>${a.title}</h1><p class="lead">${a.description}</p><p class="mut">${a.author} · ${dt(a.date + "T00:00:00Z", "UTC", "d")} · ${a.readMin} min read</p></div><div class="scroll">↓<br>SCROLL TO EXPLORE</div></section>${body}
  <section class="wrap refs"><h2>References</h2><ol>${a.references.map(r => `<li><a href="${r.url}" target="_blank" rel="noopener">${r.title}</a>${r.note ? ` <small>${r.note}</small>` : ""}</li>`).join("")}</ol></section>
  <section class="wrap cols"><form id="cf"><h3>Leave a comment</h3><input name="name" placeholder="Name" aria-label="Name" required><input name="email" type="email" placeholder="Email" aria-label="Email" required><textarea name="c" rows="5" placeholder="Comment" aria-label="Comment" required></textarea><label>${x} + ${y} = <input name="cap" inputmode="numeric" aria-label="CAPTCHA answer" required style="width:5rem"></label><small>Demo CAPTCHA only. Use hCaptcha or Turnstile with a backend.</small><button class="btn">Send</button><p id="cm" class="mut" role="status"></p></form><div id="rel"></div></section>`;
  const drawRel = () => { const r = rel[ri]; $("#rel").innerHTML = r ? `<h3>Related articles</h3><div class="rs"><button data-r="-1" aria-label="Previous">‹</button><a href="#/articles/${r.slug}"><img src="${img(r.image, r.slug)}" alt=""><span>${r.short || r.title}</span></a><button data-r="1" aria-label="Next">›</button></div><div class="dots">${rel.map((_, i) => `<i class="${i === ri ? "on" : ""}"></i>`).join("")}</div>` : ""; };
  drawRel();
  app.onclick = e => { const m = e.target.closest("[data-m]"); if (m) viewer(seq, +m.dataset.m, "article"); const r = e.target.closest("[data-r]"); if (r) { ri = (ri + +r.dataset.r + rel.length) % rel.length; drawRel(); } };
  $("#cf").onsubmit = async e => { e.preventDefault(); const f = e.target; if (+f.cap.value !== x + y) { $("#cm").textContent = "Wrong answer. Try again."; return; } await api.submitComment({ name: f.name.value, email: f.email.value, text: f.c.value }); f.reset(); $("#cm").textContent = "Demo mode: nothing was stored. With a backend, this comment would be Pending until approved."; };
}

// ---------- SPACEFLIGHT ----------
async function flights() {
  const [ms, ev, m] = await Promise.all([api.missions(), api.events(), api.featuredMission()]);
  const S = { tab: "next", size: 10, page: 1, F: { company: new Set(), rocket: new Set(), site: new Set() }, from: "", to: "" };
  const fac = k => [...new Set(ms.map(x => x[k]))].sort(), L = { company: "Company", rocket: "Rocket type", site: "Launch site" };
  const fp = () => `<div class="fp">${Object.keys(L).map(k => `<fieldset><legend>${L[k]}</legend>${fac(k).map(v => `<label><input type="checkbox" data-k="${k}" value="${v}"${S.F[k].has(v) ? " checked" : ""}> ${v}</label>`).join("")}</fieldset>`).join("")}<fieldset><legend>Date range</legend><label>From <input type="date" id="df" value="${S.from}"></label><label>To <input type="date" id="dto" value="${S.to}"></label></fieldset></div>`;
  const vb = (u, l) => u ? `<a class="btn sm" href="${u}" target="_blank" rel="noopener">${l}</a>` : `<span class="btn sm off">${l}: Not Available Yet</span>`;
  const rows = () => ms.filter(x => S.tab === "next" ? !x.result : !!x.result).filter(x => Object.keys(L).every(k => !S.F[k].size || S.F[k].has(x[k])))
    .filter(x => (!S.from || (x.net && x.net.slice(0, 10) >= S.from)) && (!S.to || (x.net && x.net.slice(0, 10) <= S.to)))
    .sort((a, b) => S.tab === "next" ? (a.net ? +new Date(a.net) : 1e18) - (b.net ? +new Date(b.net) : 1e18) : +new Date(b.net) - +new Date(a.net));
  const paint = () => { const l = rows(), pages = Math.max(1, Math.ceil(l.length / S.size)); S.page = Math.min(Math.max(S.page, 1), pages);
    $("#fl").innerHTML = l.length ? l.slice((S.page - 1) * S.size, S.page * S.size).map(x => S.tab === "next"
      ? `<div class="fr"><span>#${x.n}</span><b>${x.name}</b>${x.net ? `<span data-cd="${x.net}">${cd(x.net)}</span>` : "<span>—</span>"}<span data-dt="${x.net || ""}" data-p="d">${dt(x.net, tz, "d")}</span><span class="pill ${x.status === "GO" ? "go" : "tbd"}">${x.status}</span><a class="btn sm" href="${x.infoUrl || "#/spaceflight"}">Details</a></div>`
      : `<div class="fr past"><b>${x.name}</b><span>${x.result}</span><span data-dt="${x.net}" data-p="d">${dt(x.net, tz, "d")}</span><a class="btn sm" href="${x.infoUrl || "#/spaceflight"}">Details</a>${vb(x.videoOfficial, "Watch Official")}${vb(x.videoSummary, "Watch Summary")}</div>`).join("") : `<p class="empty">No Flights Found</p>`;
    $("#pg").innerHTML = `<button data-pg="-1" aria-label="Previous page">‹</button><span>Page ${S.page} / ${pages}</span><button data-pg="1" aria-label="Next page">›</button><select id="ps" aria-label="Items per page">${[5, 10, 15, 20].map(n => `<option${n === S.size ? " selected" : ""}>${n}</option>`).join("")}</select>`; };
  app.innerHTML = `<section class="fh full"><svg class="rocket" viewBox="0 0 100 400" aria-hidden="true"><path d="M50 0C70 60 75 130 70 260H30C25 130 30 60 50 0Z" fill="#dfe6ee"/><path d="M30 260L10 330V260ZM70 260l20 70v-70z" fill="#9aa7b6"/><rect x="38" y="260" width="24" height="40" fill="#6c7886"/></svg>
  <div class="glass panel"><p class="eyebrow">Next spaceflight</p><h1>${m.name}</h1><div class="cd" data-cd="${m.net || ""}">${cd(m.net)}</div><div class="tz"><button data-tz="UTC">UTC</button><button data-tz="Local">Local time</button></div>
  ${dl({ Date: `<span data-dt="${m.net || ""}" data-p="d"></span>`, Time: `<span data-dt="${m.net || ""}" data-p="t"></span>`, Rocket: m.rocket, Company: m.company, Country: m.country, State: m.state, "Launch pad": m.site })}
  <a class="btn" href="${m.infoUrl || "#/spaceflight"}">More info</a> <button class="btn ghost" data-go>Explore upcoming flights</button></div><div class="scroll">↓<br>Scroll</div></section>
  <section class="wrap" id="fls"><div class="fbar"><div><button class="btn sm ghost" data-fb>Filter</button><div id="fpw"></div></div><div class="chips"><button data-tab="next" class="on">Next</button><button data-tab="past">Past</button></div><span></span></div><div class="tw"><div class="fl" id="fl"></div></div><div class="pager" id="pg"></div></section>
  <section class="wrap evs"><div><p class="eyebrow">Related space events</p><div class="ev f"><img src="${img(ev[0].image, ev[0].id)}" alt=""><div><h2>${ev[0].title}</h2><small>${dt(ev[0].date, tz, "d")} · ${dt(ev[0].date, tz, "t")}</small><p>${ev[0].description}</p></div></div></div><div>${ev.slice(1, 5).map(e => `<div class="ev"><img src="${img(e.image, e.id)}" alt=""><div><h3>${e.title}</h3><small>${dt(e.date, tz, "d")} · ${dt(e.date, tz, "t")}</small><p class="mut">${e.description}</p></div></div>`).join("")}<p style="margin-top:1.5rem"><a class="btn" href="${site.cta.relatedEvents}">Explore related events</a></p></div></section>`;
  $(".fh").style.setProperty("--hi", `url('${site.spaceflightHero}')`); paint(); refreshDt();
  app.onclick = e => { const b = e.target.closest("button"); if (!b) return; const d = b.dataset;
    if (d.tz) { tz = d.tz; refreshDt(); } else if ("go" in d) $("#fls").scrollIntoView();
    else if (d.tab) { S.tab = d.tab; S.page = 1; $$("[data-tab]").forEach(x => x.classList.toggle("on", x === b)); paint(); }
    else if (d.pg) { S.page += +d.pg; paint(); } else if ("fb" in d) $("#fpw").innerHTML = $("#fpw").innerHTML ? "" : fp(); };
  app.onchange = e => { const t = e.target; if (t.dataset.k) { const s = S.F[t.dataset.k]; t.checked ? s.add(t.value) : s.delete(t.value); } else if (t.id === "df") S.from = t.value; else if (t.id === "dto") S.to = t.value; else if (t.id === "ps") S.size = +t.value; else return; S.page = 1; paint(); };
}

// ---------- GALLERY ----------
async function gallery() {
  const [items, cats] = await Promise.all([api.gallery(), api.categories()]);
  const S = { type: "all", cats: new Set(), q: "", n: 12 };
  const vis = () => items.filter(g => (S.type === "all" || g.type === S.type) && (!S.cats.size || g.categories.some(c => S.cats.has(c))) && (g.title + g.source + g.categories).toLowerCase().includes(S.q));
  const vi = g => ({ kind: g.type, src: g.src, thumb: g.thumb, title: g.title, meta: `${g.source} · ${g.year}`, id: g.id, alt: g.title });
  app.innerHTML = `<section class="wrap pt"><h1>Gallery</h1><div class="bar"><input id="q" type="search" placeholder="Search media" aria-label="Search media"><div class="chips" id="ty">${[["all", "All"], ["image", "Images"], ["video", "Videos"]].map(([t, l]) => `<button data-t="${t}">${l}</button>`).join("")}</div></div><div class="chips" id="ct">${cats.map(c => `<button data-c="${c}">${c}</button>`).join("")}</div><div id="gm" class="mas"></div><div id="gb" class="center"></div></section>`;
  const paint = () => { const v = vis(); $("#gm").innerHTML = v.length ? v.slice(0, S.n).map(g => `<button class="gi" data-id="${g.id}" style="aspect-ratio:${g.ratio}"><img loading="lazy" src="${img(g.thumb || g.src, g.id)}" alt="${g.title}">${g.type === "video" ? '<span class="play">▶</span>' : ""}<span class="hv"><b>${g.title}</b><small>${g.source} · ${g.year}</small></span></button>`).join("") : `<p class="empty">No media found</p>`;
    $("#gb").innerHTML = v.length > S.n ? `<button class="btn" id="lm">Load more</button>` : ""; $$("#ty button").forEach(b => b.classList.toggle("on", b.dataset.t === S.type)); $$("#ct button").forEach(b => b.classList.toggle("on", S.cats.has(b.dataset.c))); };
  paint(); $("#q").oninput = e => { S.q = e.target.value.toLowerCase(); S.n = 12; paint(); };
  app.onclick = e => { const b = e.target.closest("button"); if (!b) return; const d = b.dataset;
    if (d.t) { S.type = d.t; S.n = 12; } else if (d.c) { S.cats.has(d.c) ? S.cats.delete(d.c) : S.cats.add(d.c); S.n = 12; } else if (b.id === "lm") S.n += 12;
    else if (d.id) { const v = vis(); return viewer(v.map(vi), v.findIndex(g => g.id === d.id), "gallery"); } else return; paint(); };
}

// ---------- VIEWER (article = full width; gallery = 70% media / 30% independent list) ----------
function viewer(list, start, mode) {
  let i = start, z = 1, arrow = false; ov.className = "ov on " + mode; document.body.style.overflow = "hidden";
  const th_ = x => img(x.kind === "image" ? x.src || x.thumb : x.thumb, x.id || x.title);
  const draw = () => { const it = list[i], st = $(".vlist", ov)?.scrollTop || 0;
    ov.innerHTML = `<div class="vwrap"><div class="vmain"><div class="vtop"><button data-a="close" aria-label="Close viewer">✕</button></div><div class="vstage">${it.kind === "video" ? (it.src ? `<video controls src="${it.src}"></video>` : `<div class="nov">Video file not added yet</div>`) : `<img src="${img(it.src || it.thumb, it.id || it.title)}" alt="${it.alt || it.title || ""}"${z > 1 ? ` style="width:${z * 100}%;max-width:none;max-height:none"` : ""}>`}</div>
    <button class="va l" data-a="prev" aria-label="Previous">‹</button><button class="va r" data-a="next" aria-label="Next">›</button>
    <div class="vbar"><div><b>${it.title || ""}</b><br><small>${it.meta || ""}</small></div><div>${it.kind === "image" ? `<button data-a="zout" aria-label="Zoom out">−</button> <button data-a="zin" aria-label="Zoom in">+</button> ${it.src ? `<a class="btn sm" href="${it.src}" download>Download</a>` : `<small>Download unavailable (placeholder)</small>`}` : `<select id="sp" aria-label="Playback speed">${[.5, 1, 1.5, 2].map(s => `<option${s === 1 ? " selected" : ""} value="${s}">${s}×</option>`).join("")}</select>`}</div></div></div>
    ${mode === "gallery" ? `<aside class="vlist" aria-label="Media list">${list.map((x, j) => `<button class="vi${j === i ? " sel" : ""}" data-j="${j}"><img loading="lazy" src="${th_(x)}" alt=""><span><b>${x.title}</b><small>${x.meta}</small></span></button>`).join("")}</aside>` : ""}</div>`;
    const l = $(".vlist", ov); if (l) { l.scrollTop = st; if (arrow) $(".sel", l).scrollIntoView({ block: "nearest" }); } arrow = false; };
  ov.onclick = e => { const b = e.target.closest("[data-a],[data-j]"); if (!b) return;
    if (b.dataset.j !== undefined) { i = +b.dataset.j; z = 1; } else { const a = b.dataset.a; if (a === "close") return closeOv(); if (a === "zin") z = Math.min(4, z + .5); else if (a === "zout") z = Math.max(1, z - .5); else { i = (i + (a === "next" ? 1 : -1) + list.length) % list.length; z = 1; arrow = true; } } draw(); };
  ov.onchange = e => { const v = $("video", ov); if (v && e.target.id === "sp") v.playbackRate = +e.target.value; };
  document.onkeydown = e => { if (e.key === "Escape") closeOv(); else if (e.key === "ArrowRight" || e.key === "ArrowLeft") { i = (i + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length; z = 1; arrow = true; draw(); } };
  draw();
}

// ---------- SEARCH ----------
async function search() {
  const [ar, ms, g] = await Promise.all([api.articles(), api.missions(), api.gallery()]);
  ov.className = "ov on srch"; document.body.style.overflow = "hidden";
  ov.innerHTML = `<div class="sbox"><input id="sq" placeholder="Search articles, missions, gallery" aria-label="Search"><div id="sr"></div><button data-a="close">Close</button></div>`; $("#sq").focus();
  ov.onclick = e => { if (e.target === ov || e.target.closest("[data-a]")) closeOv(); }; document.onkeydown = e => e.key === "Escape" && closeOv();
  $("#sq").oninput = e => { const q = e.target.value.toLowerCase().trim(); const hit = (arr, f, l, t) => q ? arr.filter(x => f(x).toLowerCase().includes(q)).map(x => `<a href="${l(x)}" data-a="close">${x.title || x.name}<small>${t}</small></a>`) : [];
    $("#sr").innerHTML = q ? ([...hit(ar, x => x.title + x.description, x => "#/articles/" + x.slug, "Article"), ...hit(ms, x => x.name + x.rocket, () => "#/spaceflight", "Spaceflight"), ...hit(g, x => x.title + x.source, () => "#/gallery", "Gallery")].join("") || `<p class="mut">No results</p>`) : ""; };
}

// ---------- ADMIN (DEMO ONLY: no backend, no login, nothing is saved) ----------
let demo;
const T = { dashboard: "Dashboard", articles: "Articles", editor: "Article editor", gallery: "Gallery", spaceflight: "Spaceflight", comments: "Comments", media: "Media library", settings: "Website settings" };
const table = (h, r) => `<div class="tw"><table><thead><tr>${h.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>${r.map(c => `<tr>${c.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const pill = s => `<span class="pill ${s === "published" || s === "approved" ? "go" : s === "pending" ? "" : "tbd"}">${s}</span>`;
const R = {
  dashboard: () => `<div class="stats">${[["Articles", demo.a.length], ["Published", demo.a.filter(a => a.status === "published").length], ["Media", demo.g.length], ["Missions", demo.m.length], ["Pending comments", demo.c.filter(c => c.state === "pending").length]].map(([k, v]) => `<div><b>${v}</b><span class="mut">${k}</span></div>`).join("")}</div><p class="mut">Sample data only. Nothing here is saved or sent anywhere.</p>`,
  articles: () => table(["Title", "Category", "Status", ""], demo.a.map((a, i) => [a.title, a.category, pill(a.status), `<button data-act="pub" data-i="${i}">${a.status === "published" ? "Unpublish" : "Publish"}</button> <a class="btn-sm" href="#/admin/editor">Edit</a> <button data-act="delart" data-i="${i}">Delete</button>`])),
  editor: () => `<div class="fields"><input placeholder="Title" aria-label="Title" value="${demo.a[0]?.title || ""}"><input placeholder="Category" aria-label="Category"><input placeholder="Author" aria-label="Author"><input type="date" aria-label="Publication date"><input placeholder="Reading time (min)" aria-label="Reading time"></div>
  <div class="tb">${[["bold", "B"], ["italic", "I"], ["underline", "U"], ["insertUnorderedList", "• List"], ["insertOrderedList", "1. List"], ["createLink", "Link"], ["undo", "Undo"], ["redo", "Redo"]].map(([c, l]) => `<button data-cmd="${c}">${l}</button>`).join("")}<select data-cmd="formatBlock" aria-label="Block style"><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="blockquote">Quote</option></select><input type="color" data-cmd="foreColor" value="#7cc4ff" aria-label="Text colour"></div>
  <div class="rte" contenteditable="true" role="textbox" aria-label="Article text">${demo.rte ?? "Write your text here…"}</div><h3 style="margin:2rem 0 .5rem">Blocks</h3>
  ${demo.blocks.map((b, i) => `<div class="blk"><span>${i + 1}. ${b.type}</span><select data-lay="${i}" aria-label="Layout">${["stacked", "media-left", "media-right", "wide"].map(l => `<option${b.layout === l ? " selected" : ""}>${l}</option>`).join("")}</select><button data-act="up" data-i="${i}" aria-label="Move up">↑</button><button data-act="dn" data-i="${i}" aria-label="Move down">↓</button><button data-act="delb" data-i="${i}" aria-label="Remove block">✕</button></div>`).join("")}
  <div class="blk"><select id="nb" aria-label="Block type">${["Text", "Image", "Video", "Gallery", "Chart", "Scientific diagram", "References", "Quote", "Table"].map(t => `<option>${t}</option>`).join("")}</select><button data-act="addb">Add block</button><span></span><button data-act="save">Save draft</button><button data-act="pub2">Publish</button></div>`,
  gallery: () => `<p><input type="file" id="up" accept="image/*,video/*" multiple aria-label="Upload media"> <small class="mut">Uploads stay in this tab only.</small></p><br><div class="agrid">${demo.g.map(g => `<figure><img src="${img(g.type === "image" ? g.src || g.thumb : g.thumb, g.id)}" alt="${g.title}"><figcaption>${g.title}<br>${g.categories.join(", ") || "Uncategorised"}</figcaption></figure>`).join("")}</div>`,
  spaceflight: () => `<p class="mut">The featured mission is ONE record, read by both the Home page and the Spaceflight hero.</p>` + table(["Mission", "Launch (UTC)", "Status", "Result", ""], demo.m.map((m, i) => [`${m.name}${demo.feat === m.id ? " ★" : ""}`, dt(m.net, "UTC"), m.status, m.result || "—", `<button data-act="feat" data-i="${i}">Set featured</button> <button data-act="delm" data-i="${i}">Delete</button>`])),
  comments: () => table(["Reader", "Comment", "State", ""], demo.c.map((c, i) => [c.name, c.text + (c.reply ? `<br><small class="mut">Reply: ${c.reply}</small>` : ""), pill(c.state), `<button data-act="appr" data-i="${i}">Approve</button> <button data-act="rej" data-i="${i}">Reject</button> <button data-act="rep" data-i="${i}">Reply</button> <button data-act="delc" data-i="${i}">Delete</button>`])),
  media: () => `<div class="agrid">${demo.g.map(g => `<figure><img src="${img(g.type === "image" ? g.src || g.thumb : g.thumb, g.id)}" alt=""><figcaption>${g.id}.${g.type === "image" ? "jpg" : "mp4"}<br><small class="mut">Reusable in articles, Home, Gallery</small></figcaption></figure>`).join("")}</div>`,
  settings: () => `<p>Website settings live in <code>config/site.config.js</code>. Edit that file on GitHub to change them; this screen only shows what is currently configured.</p><pre style="overflow:auto;margin-top:1rem">${JSON.stringify(site, null, 2).replace(/</g, "&lt;")}</pre>`
};
const A = {
  pub: i => demo.a[i].status = demo.a[i].status === "published" ? "draft" : "published",
  delart: i => { if (confirm("Delete this article? (demo)")) demo.a.splice(i, 1); },
  up: i => { if (i > 0) [demo.blocks[i - 1], demo.blocks[i]] = [demo.blocks[i], demo.blocks[i - 1]]; },
  dn: i => { if (i < demo.blocks.length - 1) [demo.blocks[i + 1], demo.blocks[i]] = [demo.blocks[i], demo.blocks[i + 1]]; },
  delb: i => { if (confirm("Remove this block?")) demo.blocks.splice(i, 1); },
  addb: () => demo.blocks.push({ type: $("#nb").value.toLowerCase(), layout: "stacked" }),
  appr: i => demo.c[i].state = "approved", rej: i => demo.c[i].state = "rejected",
  delc: i => { if (confirm("Delete this comment?")) demo.c.splice(i, 1); },
  rep: i => { const t = prompt("Reply (demo only)"); if (t) demo.c[i].reply = t; },
  feat: i => demo.feat = demo.m[i].id, delm: i => { if (confirm("Delete this mission?")) demo.m.splice(i, 1); },
  save: () => toast("Demo mode: nothing was saved."), pub2: () => toast("Demo mode: nothing was published.")
};
async function adminArticleManager() {
  await mountAdminCrud({
    root: app,
    service: adminArticles,
    title: "Articles",
    singular: "article",
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "updated_at", label: "Updated", render: value => value ? dt(value, "UTC", "d") : "—" }
    ],
    fields: [
      { name: "title", label: "Title", required: true, placeholder: "Article title" },
      { name: "slug", label: "Slug", required: true },
      { name: "short_title", label: "Short title" },
      { name: "category", label: "Category" },
      { name: "author_name", label: "Author name" },
      { name: "published_on", label: "Publication date", type: "date" },
      { name: "read_minutes", label: "Reading time (minutes)", type: "number", min: 0, defaultValue: 0 },
      { name: "cover_media_id", label: "Cover media UUID" },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
      { name: "status", label: "Status", type: "select", defaultValue: "draft", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
      { name: "blocks", label: "Content blocks (JSON)", type: "json", multiple: true, rows: 9 },
      { name: "refs", label: "References (JSON)", type: "json", multiple: true, rows: 6 }
    ],
    toPayload: values => ({ ...values, read_minutes: Number(values.read_minutes) || 0, published_on: values.published_on || null, cover_media_id: values.cover_media_id || null })
  });
}

async function adminSpaceflightManager() {
  await mountAdminCrud({
    root: app,
    service: adminEvents,
    title: "Spaceflight · Events",
    description: "Manage related space events shown on the public Spaceflight page.",
    singular: "event",
    columns: [
      { key: "title", label: "Title" },
      { key: "starts_at", label: "Starts at (UTC)", render: value => value ? dt(value, "UTC") : "—" },
      { key: "is_published", label: "Published", render: value => value ? "Yes" : "No" },
      { key: "sort_order", label: "Order" }
    ],
    fields: [
      { name: "title", label: "Event title", required: true },
      { name: "starts_at", label: "Start date and time (UTC)", type: "datetime-utc" },
      { name: "mission_id", label: "Related mission UUID (optional)" },
      { name: "image_media_id", label: "Image media UUID (optional)" },
      { name: "sort_order", label: "Sort order", type: "number", defaultValue: 0 },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "is_published", label: "Published", type: "checkbox" }
    ],
    toPayload: values => ({
      ...values,
      starts_at: values.starts_at ? new Date(values.starts_at + ":00Z").toISOString() : null,
      mission_id: values.mission_id || null,
      image_media_id: values.image_media_id || null,
      sort_order: Number(values.sort_order) || 0
    })
  });
}

async function admin(tab = "dashboard") {
  if (!R[tab]) tab = "dashboard";
  const session = await auth.session();
  if (!session) {
    app.innerHTML = `<section class="wrap pt" style="max-width:460px"><h1>Admin sign in</h1><p class="mut">Sign in with an authorized Cosmos Genesis account.</p><form id="admin-login" class="fields"><input name="email" type="email" autocomplete="username" placeholder="Email" required><input name="password" type="password" autocomplete="current-password" placeholder="Password" required><button class="btn">Sign in</button><p id="login-error" class="mut" role="status"></p></form></section>`;
    $("#admin-login").onsubmit = async e => {
      e.preventDefault();
      const form = e.currentTarget, button = $("button", form), status = $("#login-error");
      button.disabled = true; button.textContent = "Signing in…"; status.textContent = "";
      try {
        await auth.signIn(form.email.value.trim(), form.password.value);
        await auth.requireStaff();
        location.hash = "#/admin/dashboard";
        await admin(tab);
      } catch (error) {
        status.textContent = error.message || "Unable to sign in.";
        button.disabled = false; button.textContent = "Sign in";
      }
    };
    return;
  }
  try { await auth.requireStaff(); }
  catch (error) {
    await auth.signOut();
    app.innerHTML = `<section class="wrap pt"><h1>Access denied</h1><p class="mut">This account does not have staff permissions.</p><a class="btn" href="#/">Back to site</a></section>`;
    return;
  }
  if (tab === "articles" || tab === "editor") { await adminArticleManager(); return; }
  if (tab === "spaceflight") { await adminSpaceflightManager(); return; }
  demo ??= await (async () => { const [a, g, m, c, h] = await Promise.all([api.articles(), api.gallery(), api.missions(), api.comments(), api.home()]); return { a, g, m, c, feat: h.featuredMissionId, blocks: [{ type: "text", layout: "stacked" }, { type: "image", layout: "media-left" }, { type: "quote", layout: "stacked" }] }; })();
  app.innerHTML = `<div class="ad"><aside class="as" aria-label="Admin sections">${Object.entries(T).map(([k, v]) => `<a class="${k === tab ? "on" : ""}" href="#/admin/${k}">${v}</a>`).join("")}</aside><div class="ac"><div class="demo" role="note">Signed in as ${session.user.email}. Article editing is being connected.</div><div style="display:flex;justify-content:space-between;align-items:center;gap:1rem"><h2>${T[tab]}</h2><button class="btn ghost" data-admin-logout>Sign out</button></div><div id="ac">${R[tab]()}</div></div></div>`;
  const redraw = () => { demo.rte = $(".rte")?.innerHTML ?? demo.rte; $("#ac").innerHTML = R[tab](); };
  const exec = (c, v) => { if (c === "createLink") { v = prompt("Link URL"); if (!v) return; } document.execCommand(c, false, c === "formatBlock" ? `<${v}>` : v); };
  app.onmousedown = e => { if (e.target.closest("button[data-cmd]")) e.preventDefault(); };
  app.onclick = async e => { const b = e.target.closest("button"); if (!b) return; const d = b.dataset; if ("adminLogout" in d) { await auth.signOut(); location.hash = "#/admin"; return; } if (d.act) { demo.rte = $(".rte")?.innerHTML ?? demo.rte; A[d.act](+d.i); if (!["save", "pub2"].includes(d.act)) redraw(); } else if (d.cmd) exec(d.cmd); };
  app.onchange = e => { const t = e.target; if (t.dataset.cmd) exec(t.dataset.cmd, t.value); else if (t.dataset.lay !== undefined) demo.blocks[+t.dataset.lay].layout = t.value;
    else if (t.id === "up") { [...t.files].forEach(f => { const u = URL.createObjectURL(f), im = f.type.startsWith("image"); demo.g.unshift({ id: "u" + Date.now() + f.name, type: im ? "image" : "video", title: f.name, source: "Upload (demo)", year: new Date().getFullYear(), categories: [], src: im ? u : "", thumb: "" }); }); redraw(); } };
}

// ---------- ROUTER ----------
const routes = [[/^#\/?$/, home], [/^#\/articles$/, articles], [/^#\/articles\/([\w-]+)$/, article], [/^#\/spaceflight$/, flights], [/^#\/gallery$/, gallery], [/^#\/admin(?:\/(\w+))?$/, admin]];
async function route() {
  const hash = location.hash || "#/"; app.onclick = app.onchange = app.onmousedown = null; closeOv();
  for (const [r, f] of routes) { const m = hash.match(r); if (!m) continue;
    app.innerHTML = `<div class="load">Loading…</div>`;
    try { await f(...m.slice(1)); } catch (e) { console.error(e); app.innerHTML = `<p class="empty pt">Something went wrong loading this page. Reload to try again.</p>`; }
    scrollTo(0, 0); app.classList.remove("in"); void app.offsetWidth; app.classList.add("in"); return; }
  app.innerHTML = `<p class="empty pt">Page not found.</p>`;
}
addEventListener("hashchange", route); route();
