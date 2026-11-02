import { supabase } from "./supabaseClient.js";
import { auth } from "./authService.js";

/**
 * Shared staff-only CRUD service.
 * Section services provide table, selected fields, ordering and normalization;
 * authentication, querying and error propagation stay consistent here.
 */
export function createAdminCrudService({
  table,
  fields = "*",
  order = [],
  normalize = value => value,
  validate = () => {},
  beforeCreate = async value => value,
  beforeUpdate = async value => value
}) {
  const staff = () => auth.requireStaff();

  return {
    async list() {
      await staff();
      let query = supabase.from(table).select(fields);
      for (const item of order) {
        query = query.order(item.column, { ascending: item.ascending !== false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      await staff();
      const { data, error } = await supabase.from(table).select(fields).eq("id", id).single();
      if (error) throw error;
      return data;
    },

    async create(input) {
      const profile = await staff();
      const value = normalize(input);
      validate(value);
      const payload = await beforeCreate(value, profile);
      const { data, error } = await supabase.from(table).insert(payload).select(fields).single();
      if (error) throw error;
      return data;
    },

    async update(id, input) {
      const profile = await staff();
      const value = normalize(input);
      validate(value);
      const payload = await beforeUpdate(value, profile);
      const { data, error } = await supabase.from(table).update(payload).eq("id", id).select(fields).single();
      if (error) throw error;
      return data;
    },

    async remove(id) {
      await staff();
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return true;
    }
  };
}
