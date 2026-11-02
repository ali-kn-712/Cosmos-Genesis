-- Read-only schema inspection for the Cosmos Genesis staging project.
-- Run in Supabase SQL Editor. This does not modify data, policies, or schema.

-- 1) Columns, types, nullability, and defaults for content tables and views.
select
  table_schema,
  table_name,
  column_name,
  ordinal_position,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'missions',
    'gallery_entries',
    'gallery_categories',
    'media_assets',
    'space_events',
    'articles',
    'v_missions',
    'v_gallery',
    'v_events',
    'v_articles'
  )
order by table_name, ordinal_position;

-- 2) Primary keys, unique constraints, foreign keys, and check constraints.
select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  pg_get_constraintdef(c.oid, true) as definition
from information_schema.table_constraints tc
join pg_constraint c
  on c.conname = tc.constraint_name
join information_schema.tables t
  on t.table_schema = tc.constraint_schema
 and t.table_name = tc.table_name
where tc.constraint_schema = 'public'
  and tc.table_name in (
    'missions',
    'gallery_entries',
    'gallery_categories',
    'media_assets',
    'space_events'
  )
order by tc.table_name, tc.constraint_type, tc.constraint_name;

-- 3) RLS enabled/forced status for the content tables.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'missions',
    'gallery_entries',
    'gallery_categories',
    'media_assets',
    'space_events'
  )
order by c.relname;

-- 4) Existing policies and their commands/conditions.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'missions',
    'gallery_entries',
    'gallery_categories',
    'media_assets',
    'space_events'
  )
order by tablename, policyname;

-- 5) Triggers attached to content tables (useful for updated_at and audit behavior).
select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in (
    'missions',
    'gallery_entries',
    'gallery_categories',
    'media_assets',
    'space_events'
  )
order by event_object_table, trigger_name;
