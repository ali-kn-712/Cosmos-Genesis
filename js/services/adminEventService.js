import { createAdminCrudService } from "./adminCrudService.js";

const EVENT_FIELDS = "id, legacy_id, mission_id, title, starts_at, description, image_media_id, sort_order, is_published, created_at, updated_at";

function normalizeEvent(input = {}) {
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

const validateEvent = event => {
  if (!event.title) throw new Error("Event title is required.");
};

export const adminEvents = createAdminCrudService({
  table: "space_events",
  fields: EVENT_FIELDS,
  order: [
    { column: "sort_order", ascending: true },
    { column: "starts_at", ascending: true }
  ],
  normalize: normalizeEvent,
  validate: validateEvent
});
