# Cosmos Genesis

Static, build-free website (HTML + CSS + JS modules). Works on GitHub Pages as-is.
**Run locally:** `python3 -m http.server` in this folder, then open http://localhost:8000 (opening index.html by double-click will not work, because browsers block ES modules on `file://`).

## Easy edits (no programming needed)
All routine changes are made on GitHub: open the file → click the ✏️ pencil → edit → **Commit changes**.
Change only the text between quotes; keep commas, brackets and quotes.

1. **Replace the main logo** – upload a new file to `assets/logos/` named `logo.svg` (same name replaces it), or upload any name and set `logos.main` in `config/site.config.js`.
2. **Light / dark logos** – `assets/logos/logo-dark.svg` is shown in dark mode (use a light-coloured logo); `assets/logos/logo-light.svg` is shown in light mode (use a dark-coloured logo). Same rule: replace the file or change `logos.dark` / `logos.light`. Favicon: `assets/brand/favicon.svg` (`logos.favicon`).
3. **Navigation links** – `nav` in `config/site.config.js`. One line per link: `{ label: "Gallery", href: "#/gallery" }`. Button destinations are in `cta`.
4. **Social media URLs** – `social` in the same file.
5. **Footer and contact** – `footer` and `contact` in the same file.
6. **Sample content** – `content/home.js` (hero video, featured article/mission/gallery picks), `content/articles.js`, `content/spaceflight.js`, `content/gallery.js`. Put images in `assets/images/` and use paths like `"assets/images/nebula.jpg"`. Empty `""` shows a generated placeholder. Items marked `placeholder: true` are **samples, not real data**. The Spaceflight hero background is `assets/images/spaceflight-hero.jpg`.
7. **Featured mission** – change `featuredMissionId` in `content/home.js`. Home and Spaceflight hero both read that single record.
8. **Publish** – commit to the `main` branch. In the repo: Settings → Pages → Deploy from branch → `main` / root. The site updates in about a minute.

## Admin Panel (`#/admin`) – DEMO ONLY
Visual, interactive prototype with sample data: dashboard, articles manager, article editor (rich-text toolbar, block add/reorder/remove), gallery manager, spaceflight manager, comments manager, media library, settings viewer.
- **Not connected to any backend.** Nothing is saved; changes vanish on reload.
- **No authentication.** There are no credentials in this code. Do not put real secrets in the frontend.
- Comment moderation, publishing and uploads are simulated in memory only.
- The public comment form does not store anything either.

## Connecting Supabase later
All data access goes through **`js/services/dataService.js`**; UI code never touches data sources directly.
1. Create a Supabase project (PostgreSQL) with tables: `articles`, `article_blocks`, `media`, `missions`, `events`, `comments` (state: pending/approved/rejected), `profiles` (role).
2. Enable Supabase Auth for administrators; add roles via `profiles.role` and Row Level Security policies (public read of published content only; writes for admins).
3. Use Supabase Storage for images and video (`media` table stores URLs).
4. Replace each function body in `dataService.js` with a Supabase query, and add write functions (create/update/delete) used by the admin screens. Only the public anon key belongs in the frontend; never the service-role key.
5. Admin sign-in should use a dedicated, protected auth flow server-side (Supabase Auth), with credentials never sent through, or stored by, the comments table.

## Structure
`config/` site settings · `content/` editable sample content · `js/services/` data layer · `js/app.js` pages + demo admin · `css/styles.css` · `assets/` logos, images, video.
