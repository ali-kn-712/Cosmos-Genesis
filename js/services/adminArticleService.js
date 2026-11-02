import { createAdminCrudService } from "./adminCrudService.js";

const ARTICLE_FIELDS = [
  "id", "slug", "title", "short_title", "description", "category",
  "author_name", "author_id", "published_on", "read_minutes",
  "cover_media_id", "status", "blocks", "refs", "created_by",
  "updated_by", "created_at", "updated_at"
].join(", ");

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

const validateArticle = article => {
  if (!article.title || !article.slug) throw new Error("Article title and slug are required.");
};

export const adminArticles = createAdminCrudService({
  table: "articles",
  fields: ARTICLE_FIELDS,
  order: [{ column: "updated_at", ascending: false }],
  normalize: normalizeArticle,
  validate: validateArticle,
  beforeCreate: (article, profile) => ({
    ...article,
    author_id: profile.id,
    created_by: profile.id,
    updated_by: profile.id
  }),
  beforeUpdate: (article, profile) => ({ ...article, updated_by: profile.id })
});
