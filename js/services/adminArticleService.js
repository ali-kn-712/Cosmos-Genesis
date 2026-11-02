import { supabase } from "./supabaseClient.js";
import { auth } from "./authService.js";

const ARTICLE_FIELDS = [
  "id", "slug", "title", "short_title", "description", "category",
  "author_name", "author_id", "published_on", "read_minutes",
  "cover_media_id", "status", "blocks", "refs", "created_by",
  "updated_by", "created_at", "updated_at"
].join(", ");

async function currentStaff() {
  const profile = await auth.requireStaff();
  return profile;
}

function normalizeArticle(input = {}) {
  return {
    slug: String(input.slug || "").trim(),
    title: String(input.title || "").trim(),
    short_title: String(input.short_title || "").trim() || null,
    description: String(input.description || "").trim() || null,
    category: String(input.category || "").trim() || null,
    author_name: String(input.author_name || "").trim() || null,
    published_on: input.published_on || null,
    read_minutes: Number(input.read_minutes) || 0,
    cover_media_id: input.cover_media_id || null,
    status: input.status === "published" ? "published" : "draft",
    blocks: Array.isArray(input.blocks) ? input.blocks : [],
    refs: Array.isArray(input.refs) ? input.refs : []
  };
}

export const adminArticles = {
  async list() {
    await currentStaff();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_FIELDS)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    await currentStaff();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_FIELDS)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(input) {
    const profile = await currentStaff();
    const article = normalizeArticle(input);
    if (!article.title || !article.slug) {
      throw new Error("Article title and slug are required.");
    }
    const { data, error } = await supabase
      .from("articles")
      .insert({
        ...article,
        author_id: profile.id,
        created_by: profile.id,
        updated_by: profile.id
      })
      .select(ARTICLE_FIELDS)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, input) {
    const profile = await currentStaff();
    const article = normalizeArticle(input);
    if (!article.title || !article.slug) {
      throw new Error("Article title and slug are required.");
    }
    const { data, error } = await supabase
      .from("articles")
      .update({ ...article, updated_by: profile.id })
      .eq("id", id)
      .select(ARTICLE_FIELDS)
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    await currentStaff();
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
};
