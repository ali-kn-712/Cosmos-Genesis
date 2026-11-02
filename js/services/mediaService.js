import { supabase } from "./supabaseClient.js";
import { auth } from "./authService.js";

const BUCKET = "site-media";
const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

function safeName(name) {
  return String(name || "upload")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-100) || "upload";
}

export const media = {
  async uploadCover(file) {
    const profile = await auth.requireStaff();
    if (!(file instanceof File)) throw new Error("Choose an image file first.");
    if (!IMAGE_TYPES.has(file.type)) throw new Error("Cover must be JPG, PNG, WebP, AVIF, or GIF.");
    if (file.size > MAX_IMAGE_SIZE) throw new Error("Cover image must be 12 MB or smaller.");

    const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "img";
    const path = `articles/${profile.id}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false
    });
    if (error) throw error;

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return {
      bucket: BUCKET,
      path: data.path,
      publicUrl: publicData.publicUrl,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: profile.id,
      extension: ext
    };
  },

  async remove(path) {
    await auth.requireStaff();
    if (!path || !String(path).startsWith("articles/")) {
      throw new Error("Invalid article media path.");
    }
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  }
};
