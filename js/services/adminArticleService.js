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
    read_minutes: input.read_minutes === "" || input.read_minutes == null ? 0 : Number(input.read_minutes),
    cover_media_id: input.cover_media_id || null,
    status: input.status === "published" ? "published" : "draft",
    blocks: Array.isArray(input.blocks) ? input.blocks : [],
    refs: Array.isArray(input.refs) ? input.refs : []
  };
}

const validateArticle = article => {
  if (!article.title || !article.slug) throw new Error("Article title and slug are required.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
    throw new Error("Slug must use lowercase English letters, numbers, and single hyphens.");
  }
  if (!Number.isInteger(article.read_minutes) || article.read_minutes < 0) {
    throw new Error("Reading time must be a non-negative whole number.");
  }
  if (!Array.isArray(article.blocks) || !Array.isArray(article.refs)) {
    throw new Error("Article blocks and references must be JSON arrays.");
  }
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
