import { supabase } from "./supabaseClient.js";
import { auth } from "./authService.js";

const FIELDS = "id, legacy_id, mission_id, title, starts_at, description, image_media_id, sort_order, is_published, created_at, updated_at";

async function staff() {
  return auth.requireStaff();
}

function normalize(input = {}) {
  return {
    mission_id: input.mission_id || null,
    title: String(input.title || "").trim(),
    starts_at: input.starts_at || null,
    description: String(input.description || "").trim() || null,
    image_media_id: input.image_media_id || null,
    sort_order: Number.isFinite(Number(input.sort_order)) ? Number(input.sort_order) : 0,
    is_published: input.is_published === true
  };
}

export const adminEvents = {
  async list() {
    await staff();
    const { data, error } = await supabase.from("space_events").select(FIELDS).order("sort_order", { ascending: true }).order("starts_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async create(input) {
    await staff();
    const value = normalize(input);
    if (!value.title) throw new Error("Event title is required.");
    const { data, error } = await supabase.from("space_events").insert(value).select(FIELDS).single();
    if (error) throw error;
    return data;
  },
  async update(id, input) {
    await staff();
    const value = normalize(input);
    if (!value.title) throw new Error("Event title is required.");
    const { data, error } = await supabase.from("space_events").update(value).eq("id", id).select(FIELDS).single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    await staff();
    const { error } = await supabase.from("space_events").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
};
