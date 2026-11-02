// ============================================================================
// DATA / SERVICE LAYER — the ONLY file that knows where data comes from.
// Public article reads use Supabase views; other sections remain on local data
// until their respective database mappings are implemented.
// ============================================================================
import { supabase } from "./supabaseClient.js";
import { site } from "../../config/site.config.js";
import { home } from "../../content/home.js";
import { articles as localArticles } from "../../content/articles.js";
import { missions, events } from "../../content/spaceflight.js";
import { gallery, categories } from "../../content/gallery.js";
import { sampleComments } from "../../content/comments.js";

const wait = v => new Promise(r => setTimeout(() => r(structuredClone(v)), 120));

const mapArticle = row => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  short: row.short ?? "",
  description: row.description ?? "",
  category: row.category ?? "",
  author: row.author ?? "",
  date: row.date,
  readMin: row.readMin ?? row.read_min ?? 0,
  image: row.image ?? "",
  status: row.status ?? "published"
});

const mapArticleDetail = row => ({
  ...mapArticle(row),
  blocks: Array.isArray(row.blocks) ? row.blocks : [],
  references: Array.isArray(row.references) ? row.references : []
});

async function publishedArticles() {
  const { data, error } = await supabase
    .from("v_articles")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapArticle);
}

async function articleDetail(slug) {
  const { data, error } = await supabase
    .from("v_article_detail")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapArticleDetail(data) : null;
}

export const api = {
  site: () => site,
  home: () => wait(home),
  articles: async () => {
    try { return await publishedArticles(); }
    catch (error) {
      console.warn("Supabase article list unavailable; using local sample data.", error);
      return wait([...localArticles].sort((a, b) => b.date.localeCompare(a.date)));
    }
  },
  article: async slug => {
    try { return await articleDetail(slug); }
    catch (error) {
      console.warn("Supabase article detail unavailable; using local sample data.", error);
      return wait(localArticles.find(a => a.slug === slug) || null);
    }
  },
  missions: () => wait(missions),
  featuredMission: () => wait(missions.find(m => m.id === home.featuredMissionId)),
  events: () => wait(events),
  gallery: () => wait(gallery),
  categories: () => wait(categories),
  comments: () => wait(sampleComments),
  // Demo only until the comments table and public submission policy are wired.
  submitComment: async () => ({ state: "pending", stored: false })
};
