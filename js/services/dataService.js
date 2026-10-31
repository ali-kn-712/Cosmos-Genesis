// ============================================================================
// DATA / SERVICE LAYER — the ONLY file that knows where data comes from.
// Today: local files in /content. LATER (Supabase): replace each function body, e.g.
//   const { data } = await supabase.from('articles').select('*').eq('status','published');
// UI code in app.js never changes. Not connected to any backend yet.
// ============================================================================
import { site } from "../../config/site.config.js";
import { home } from "../../content/home.js";
import { articles } from "../../content/articles.js";
import { missions, events } from "../../content/spaceflight.js";
import { gallery, categories } from "../../content/gallery.js";
import { sampleComments } from "../../content/comments.js";

const wait = v => new Promise(r => setTimeout(() => r(structuredClone(v)), 120));
export const api = {
  site: () => site,
  home: () => wait(home),
  articles: () => wait([...articles].sort((a, b) => b.date.localeCompare(a.date))),
  article: slug => wait(articles.find(a => a.slug === slug) || null),
  missions: () => wait(missions),
  featuredMission: () => wait(missions.find(m => m.id === home.featuredMissionId)), // single source of truth
  events: () => wait(events),
  gallery: () => wait(gallery),
  categories: () => wait(categories),
  comments: () => wait(sampleComments),
  // Demo only: nothing is stored. Supabase: insert into comments with state='pending'.
  submitComment: async () => ({ state: "pending", stored: false })
};
