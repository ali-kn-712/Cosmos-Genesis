import { supabase } from "./supabaseClient.js";
import { auth } from "./authService.js";

const BUCKET = "site-media";
const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const MAX_VIDEO_SIZE = 250 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MEDIA_TYPES = new Set([...IMAGE_TYPES, ...VIDEO_TYPES]);

function safeName(name) {
  return String(name || "upload").normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "upload";
}

function publicFile(path, item = {}) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { name: item.name || path.split("/").pop(), path, publicUrl: data.publicUrl,
    createdAt: item.created_at || null, metadata: item.metadata || {} };
}

export const media = {
  async list() {
    await auth.requireStaff();
    const { data, error } = await supabase.storage.from(BUCKET).list("library", {
      limit: 100, sortBy: { column: "created_at", order: "desc" }
    });
    if (error) throw error;
    const folders = (data || []).filter(item => !item.id && item.name);
    const files = (data || []).filter(item => item.id);
    const nested = await Promise.all(folders.map(async folder => {
      const prefix = `library/${folder.name}`;
      const result = await supabase.storage.from(BUCKET).list(prefix, {
        limit: 100, sortBy: { column: "created_at", order: "desc" }
      });
      if (result.error) throw result.error;
      return (result.data || []).filter(item => item.id).map(item => publicFile(`${prefix}/${item.name}`, item));
    }));
    return [...files.map(item => publicFile(`library/${item.name}`, item)), ...nested.flat()]
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  },

  async upload(file) {
    const profile = await auth.requireStaff();
    if (!(file instanceof File)) throw new Error("Choose a file first.");
    if (!MEDIA_TYPES.has(file.type)) throw new Error("Use JPG, PNG, WebP, AVIF, GIF, MP4, WebM, or MOV.");
    const isVideo = VIDEO_TYPES.has(file.type);
    if (file.size > (isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE)) {
      throw new Error(isVideo ? "Video must be 250 MB or smaller." : "Image must be 12 MB or smaller.");
    }
    const path = `library/${profile.id}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type, cacheControl: "3600", upsert: false
    });
    if (error) throw error;
    return { ...publicFile(data.path), mimeType: file.type, size: file.size };
  },

  async uploadCover(file) {
    const profile = await auth.requireStaff();
    if (!(file instanceof File)) throw new Error("Choose an image file first.");
    if (!IMAGE_TYPES.has(file.type)) throw new Error("Cover must be JPG, PNG, WebP, AVIF, or GIF.");
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Cover image must be 12 MB or smaller.");
    const path = `articles/${profile.id}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type, cacheControl: "3600", upsert: false
    });
    if (error) throw error;
    return { ...publicFile(data.path), bucket: BUCKET, fileName: file.name,
      mimeType: file.type, size: file.size, uploadedBy: profile.id };
  },

  async remove(path) {
    await auth.requireStaff();
    if (!path || !/^(articles|library)\\//.test(String(path))) throw new Error("Invalid media path.");
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  }
};
