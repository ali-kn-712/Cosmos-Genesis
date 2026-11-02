# Cosmos Genesis

Static, build-free website (HTML, CSS and JavaScript modules), hosted on GitHub Pages.

## Run locally

Run `python3 -m http.server` from the repository root and open `http://localhost:8000`. Opening `index.html` directly via `file://` will not work because the browser blocks ES modules.

## Site configuration and content

- `config/site.config.js`: brand, logos, navigation, social links, contact and footer.
- `content/home.js`: home hero and featured content.
- `content/articles.js`: local fallback article samples.
- `content/spaceflight.js`: local mission and event fallback samples.
- `content/gallery.js`: local gallery fallback samples.
- `assets/`: logos, images and other static assets.

Routine text and link changes can be committed directly through GitHub's file editor. Keep the existing JavaScript syntax, quotes and commas intact.

## Admin panel

Open `#/admin`. Sign-in uses Supabase Auth; only profiles with the `admin` or `editor` role pass the staff check. Public sign-up is expected to remain disabled. Never put a Supabase service-role key in browser code.

### Connected admin features

- **Dashboard:** live article and Spaceflight event counts.
- **Articles:** staff-only CRUD against `articles`.
- **Spaceflight events:** staff-only CRUD against `space_events`.
- **Media library:** staff-only listing, upload and deletion in the `site-media` Storage bucket. Images up to 12 MB and MP4/WebM/MOV videos up to 250 MB are accepted by the client.

These features depend on the Supabase schema, RLS policies and Storage policies matching the SQL and service code in this branch. A successful code commit does not itself prove the live Supabase permissions or browser workflow have been tested.

### Not yet connected to live admin CRUD

Missions, gallery entries/categories, comments/moderation and website settings still use sample/local data or configuration. They must not be described as live editing until their actual database schema and RLS rules have been inspected and implemented.

The public article and event reads use Supabase with local sample fallbacks when the backend query fails or has no published event rows. The public comment submission is currently a non-persistent placeholder.

## Supabase setup files

Run these from the Supabase SQL Editor in the staging project, reviewing the output/errors:

1. `supabase/sql/storage-policies.sql` — staff-only access policies for the `site-media` bucket.
2. `supabase/sql/inspect-content-schema.sql` — read-only schema, constraints, RLS policy and trigger inventory used to implement the remaining content sections safely.

Do not run guessed migrations against production. Keep legacy R2 fields intact; the migration to Supabase Storage metadata should be designed after inspecting the real schema.

## Deployment workflow

The development branch is `supabase-integration`. Review and test its changes before merging to `main`. GitHub Pages should publish from `main` at the repository root, unless the repository's Pages settings specify otherwise.
