// ============================================================================
// COSMOS GENESIS — SITE CONFIG.  Edit this file directly on GitHub (pencil icon).
// Only change the text between quotes. Do not delete commas, brackets or quotes.
// ============================================================================
export const site = {
  // --- BRAND -----------------------------------------------------------------
  brand: { name: "Cosmos Genesis", slogan: "Where every universe begins with a question." },

  // --- LOGOS (replace the file, or change the path) ---------------------------
  // "dark" = logo shown while the site is in DARK mode (use a light-coloured logo).
  // "light" = logo shown in LIGHT mode (use a dark-coloured logo).
  // "main" = fallback if one of the above is missing. The hero always uses dark/main.
  logos: {
    main: "assets/logos/logo.svg",
    light: "assets/logos/logo-light.svg",
    dark: "assets/logos/logo-dark.svg",
    favicon: "assets/brand/favicon.svg"
  },
  spaceflightHero: "assets/images/spaceflight-hero.jpg", // put the approved reference image here

  // --- NAVIGATION (left side of the bar). Add/remove lines freely. -----------
  nav: [
    { label: "Home", href: "#/" },
    { label: "Articles", href: "#/articles" },
    { label: "Spaceflight", href: "#/spaceflight" },
    { label: "Gallery", href: "#/gallery" }
  ],

  // --- BUTTON DESTINATIONS ----------------------------------------------------
  cta: {
    explore: "#/spaceflight", moreFlights: "#/spaceflight", moreArticles: "#/articles",
    moreImages: "#/gallery", relatedEvents: "#/spaceflight"
  },

  // --- SOCIAL LINKS (shown in footer) — replace the example URLs -------------
  social: [
    { label: "YouTube", url: "https://www.youtube.com/" },
    { label: "Instagram", url: "https://www.instagram.com/" },
    { label: "X", url: "https://x.com/" },
    { label: "GitHub", url: "https://github.com/ali-kn-712" }
  ],

  // --- CONTACT ------------------------------------------------------------------
  contact: { email: "contact@example.com", location: "Add your location here" },

  // --- FOOTER -------------------------------------------------------------------
  footer: {
    text: "Space, astronomy and aerospace, explained with care.",
    links: [{ label: "Articles", href: "#/articles" }, { label: "Gallery", href: "#/gallery" }],
    copyright: "© 2026 Cosmos Genesis. All rights reserved."
  },

  // --- OTHER EXTERNAL LINKS -------------------------------------------------------
  external: { liveSite: "https://ali-kn-712.github.io/Cosmos-Genesis/", privacy: "#" }
};
