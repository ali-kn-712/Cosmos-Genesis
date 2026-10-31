// SAMPLE ARTICLES (placeholder:true = sample text, not real reporting).
// Leave image/src as "" to show a generated placeholder; or use "assets/images/file.jpg".
// Block types: text | media (layout media-left|media-right) | wide | quote
const p = "Sample paragraph. Replace with real, sourced editorial content.";
const mk = (slug, title, short, category, date) => ({
  slug, title, short, description: `${title}: sample description.`, category, author: "Cosmos Genesis",
  date, readMin: 6, image: "", placeholder: true, status: "published",
  blocks: [
    { type: "text", html: `<h2>Sample section</h2><p>${p}</p>` },
    { type: "media", layout: "media-left", html: `<p>${p}</p>`, items: [
      { kind: "image", src: "", alt: "Sample vertical image", caption: "Sample caption", ratio: "3/4" },
      { kind: "image", src: "", alt: "Sample image", ratio: "4/3" }] },
    { type: "media", layout: "media-right", html: `<p>${p}</p>`, items: [
      { kind: "video", src: "", poster: "", alt: "Sample video", caption: "Sample video" }] },
    { type: "wide", item: { kind: "image", src: "", alt: "Sample diagram", caption: "Sample scientific diagram", ratio: "21/9" } },
    { type: "quote", text: "Sample pull quote.", cite: "Source" }
  ],
  references: [{ title: "NASA", url: "https://www.nasa.gov/", note: "Sample reference. Replace with real sources." }]
});
export const articles = [
  mk("sample-article-one", "Sample Article One", "Sample One", "Astrophysics", "2026-10-20"),
  mk("sample-article-two", "Sample Article Two", "Sample Two", "Spaceflight", "2026-10-12"),
  mk("sample-article-three", "Sample Article Three", "Sample Three", "Astronomy", "2026-10-03"),
  mk("sample-article-four", "Sample Article Four", "Sample Four", "Engineering", "2026-09-25")
];
