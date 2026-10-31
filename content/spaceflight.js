// SAMPLE MISSIONS (placeholder:true: NOT real launch data). Times are ISO/UTC; net:null = TBD.
const h = n => new Date(Date.now() + n * 36e5).toISOString();
const M = (id, n, name, rocket, company, country, state, site, net, status, result, videoOfficial = "") =>
  ({ id, n, name, rocket, company, country, state, site, net, status, result, image: "", videoOfficial, videoSummary: "", infoUrl: "", placeholder: true });
export const missions = [
  M("m1", 1, "Sample Mission Alpha", "Sample Rocket A", "Sample Co. One", "Country A", "State A", "Sample Pad 1", h(72), "GO", null),
  M("m2", 2, "Sample Mission Beta", "Sample Rocket B", "Sample Co. Two", "Country B", "State B", "Sample Pad 2", h(200), "GO", null),
  M("m3", 3, "Sample Mission Gamma", "Sample Rocket A", "Sample Co. One", "Country A", "State A", "Sample Pad 3", null, "TBD", null),
  M("m4", 4, "Sample Mission Delta", "Sample Rocket C", "Sample Co. Three", "Country C", "State C", "Sample Pad 4", h(400), "GO", null),
  M("p1", 0, "Sample Past Mission 1", "Sample Rocket A", "Sample Co. One", "Country A", "State A", "Sample Pad 1", h(-300), "GO", "Successful", "https://example.com"),
  M("p2", 0, "Sample Past Mission 2", "Sample Rocket B", "Sample Co. Two", "Country B", "State B", "Sample Pad 2", h(-900), "GO", "Partial Success"),
  M("p3", 0, "Sample Past Mission 3", "Sample Rocket C", "Sample Co. Three", "Country C", "State C", "Sample Pad 4", h(-1500), "GO", "Failure")
];
export const events = ["ISS Docking", "ISS Undocking", "EVA", "Orbital Deployment", "Sample Event"].map((title, i) =>
  ({ id: "e" + i, title, date: h(48 + i * 60), description: "Sample event description.", image: "", placeholder: true }));
