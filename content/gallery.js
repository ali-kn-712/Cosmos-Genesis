// SAMPLE GALLERY (placeholder:true). One item can have many categories.
// src/thumb "" = generated placeholder; or "assets/images/x.jpg". ratio = width/height of the tile.
export const categories = ["Space Telescopes", "Hubble", "James Webb", "Planets & Moons", "Nebulae & Galaxies",
  "Spacecraft & Probes", "Earth & ISS", "Stars & Deep Space", "Rockets & Spaceflight"];
const G = (id, type, title, source, year, c, ratio) => ({ id, type, title, source, year, categories: c, ratio, src: "", thumb: "", placeholder: true });
export const gallery = [
  G("g1", "image", "Sample Nebula", "Sample Telescope", 2023, ["Space Telescopes", "James Webb", "Nebulae & Galaxies"], "4/5"),
  G("g2", "image", "Sample Galaxy", "Sample Telescope", 2021, ["Space Telescopes", "Hubble", "Nebulae & Galaxies"], "1/1"),
  G("g3", "video", "Sample Launch Clip", "Sample Mission", 2025, ["Rockets & Spaceflight"], "16/9"),
  G("g4", "image", "Sample Moon", "Sample Probe", 2019, ["Planets & Moons", "Spacecraft & Probes"], "3/4"),
  G("g5", "image", "Sample Orbit View", "Sample Station", 2024, ["Earth & ISS"], "3/2"),
  G("g6", "image", "Sample Star Field", "Sample Telescope", 2022, ["Stars & Deep Space", "Space Telescopes"], "4/5"),
  G("g7", "image", "Sample Planet", "Sample Probe", 2020, ["Planets & Moons"], "1/1"),
  G("g8", "video", "Sample Docking Clip", "Sample Station", 2025, ["Earth & ISS", "Spacecraft & Probes"], "4/3"),
  G("g9", "image", "Sample Cluster", "Sample Telescope", 2018, ["Hubble", "Stars & Deep Space"], "2/3"),
  G("g10", "image", "Sample Rocket", "Sample Mission", 2026, ["Rockets & Spaceflight"], "3/4"),
  G("g11", "image", "Sample Deep Field", "Sample Telescope", 2023, ["James Webb", "Stars & Deep Space"], "3/2"),
  G("g12", "image", "Sample Rover Site", "Sample Probe", 2021, ["Planets & Moons", "Spacecraft & Probes"], "1/1"),
  G("g13", "image", "Sample Aurora", "Sample Station", 2022, ["Earth & ISS"], "16/9"),
  G("g14", "image", "Sample Remnant", "Sample Telescope", 2020, ["Hubble", "Nebulae & Galaxies"], "4/5")
];
