-- Cosmos Genesis: Storage policies for the public site-media bucket.
-- Run this once in Supabase SQL Editor after creating the site-media bucket.
-- Public delivery uses the bucket's public setting; writes remain staff-only.

drop policy if exists "site_media_staff_read" on storage.objects;
create policy "site_media_staff_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_staff()
);

drop policy if exists "site_media_staff_upload" on storage.objects;
create policy "site_media_staff_upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and public.is_staff()
);

drop policy if exists "site_media_staff_update" on storage.objects;
create policy "site_media_staff_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_staff()
)
with check (
  bucket_id = 'site-media'
  and public.is_staff()
);

drop policy if exists "site_media_staff_delete" on storage.objects;
create policy "site_media_staff_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_staff()
);
