/* Airsoft · Estado de la aplicación, datos de prueba y cálculo de precios */
"use strict";

/* ---------- state ---------- */
function defaultSearch() {
  const base = "2026-10-12";
  const min = addDays(today(), 14);
  const s = base > min ? base : min;
  return { origin: "MDE", dest: "", start: s, end: addDays(s, 7), travelers: 2 };
}
const S = {
  search: store.get("search", null) || defaultSearch(),
  draft: store.get("draft", null),
  hsearch: null,
  pay: "tarjeta",
};
if (S.search.start < today()) {
  S.search = defaultSearch();
}
let F = null,
  HF = null;
const saveSearch = () => store.set("search", S.search);
const saveDraft = () => (S.draft ? store.set("draft", S.draft) : store.del("draft"));

function seed() {
  if (store.get("seeded", false)) return;
  store.set("users", [
    { nombre: "Laura", apellido: "Gómez", email: "demo@airsoft.co", pass: "Viaja2026" },
  ]);
  const b1 = makeBooking(
    {
      pkg: "a2",
      origin: "MDE",
      start: "2026-03-03",
      travelers: 2,
      room: "std",
      hotel: "siete-colores",
    },
    { nombre: "Laura", apellido: "Gómez", doc: "1036654321", email: "demo@airsoft.co" },
    "tarjeta",
    "AIR-3107",
    "2026-01-18",
  );
  const b2 = makeBooking(
    {
      pkg: "m2",
      origin: "MDE",
      start: "2025-06-20",
      travelers: 2,
      room: "std",
      hotel: "salamanca",
    },
    { nombre: "Laura", apellido: "Gómez", doc: "1036654321", email: "demo@airsoft.co" },
    "cuotas",
    "AIR-1985",
    "2025-04-02",
  );
  store.set("bookings", [b1, b2]);
  store.set("seeded", true);
}
const users = () => store.get("users", []);
const bookings = () => store.get("bookings", []);
const me = () => {
  const e = store.get("session", null);
  return e ? users().find((u) => u.email === e) || null : null;
};

/* ---------- pricing ---------- */
function calc(dr) {
  const p = P[dr.pkg];
  let pp = p.price;
  if (p.hotel && dr.hotel && dr.hotel !== p.hotel) {
    pp += Math.round(((H[dr.hotel].nightly - H[p.hotel].nightly) * p.nights) / 2 / 1000) * 1000;
  }
  if (p.hotel) pp += ROOMS[dr.room || "std"][1] * p.nights;
  const sub = pp * dr.travelers;
  const tax = Math.round((sub * 0.075) / 1000) * 1000;
  const disc = sub >= 1500000 ? 120000 : 0;
  return { pp, sub, tax, disc, total: sub + tax - disc };
}
function pkgTitle(p) {
  const d = D[p.dest];
  if (p.plan === "vuelo") return "Vuelo " + ORIG[S.search.origin] + " – " + d.name;
  return d.name + " " + PLAN[p.plan].toLowerCase() + " · " + plural(p.nights, "noche", "noches");
}
function status(b) {
  if (b.status === "Cancelada") return "Cancelada";
  return b.end < today() ? "Finalizada" : "Confirmada";
}
function makeBooking(dr, pax, method, code, created) {
  const p = P[dr.pkg];
  const c = calc(dr);
  return {
    code,
    user: pax.email,
    pkg: p.id,
    dest: p.dest,
    origin: dr.origin,
    plan: p.plan,
    start: dr.start,
    end: addDays(dr.start, p.nights),
    nights: p.nights,
    travelers: dr.travelers,
    hotel: p.hotel ? dr.hotel || p.hotel : null,
    room: dr.room || "std",
    ...c,
    pax,
    method,
    created: created || today(),
    status: "Confirmada",
  };
}
