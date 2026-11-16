/* Airsoft · Estado de la aplicación, datos de prueba y cálculo de precios */
"use strict";

/* ---------- state ---------- */
function defaultSearch() {
  const base = "2026-10-12";
  const min = addDays(today(), 14);
  const s = base > min ? base : min;
  return { origin: "MDE", amb: "nac", pais: "", dest: "", ag: "", start: s, end: addDays(s, 7), travelers: 2 };
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
// búsquedas guardadas antes de SC-001 no tenían ámbito
if (!S.search.amb) S.search.amb = S.search.dest && D[S.search.dest] ? D[S.search.dest].amb : "nac";
if (S.search.pais == null) S.search.pais = "";
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
      tasa: 4100.5,
    },
    { nombre: "Laura", apellido: "Gómez", doc: "1036654321", email: "demo@airsoft.co" },
    "cuotas",
    "AIR-1985",
    "2025-04-02",
  );
  store.set("bookings", [b1, b2]);
  store.set("seeded", true);
}
// HU-08.1: una reserva cancelada de ejemplo para mostrar los tres estados
function seedCancelada() {
  if (store.get("seededCancelada", false)) return;
  const b3 = makeBooking(
    { pkg: "c4", origin: "MDE", start: "2026-12-18", travelers: 2, room: "std", hotel: "marbella" },
    { nombre: "Laura", apellido: "Gómez", doc: "1036654321", email: "demo@airsoft.co" },
    "tarjeta",
    "AIR-2290",
    "2026-09-02",
  );
  b3.status = "Cancelada";
  store.set("bookings", bookings().concat(b3));
  store.set("seededCancelada", true);
}
const users = () => store.get("users", []);
const bookings = () => store.get("bookings", []);
const me = () => {
  const e = store.get("session", null);
  return e ? users().find((u) => u.email === e) || null : null;
};

/* ---------- SC-001: dólares, tasa del día y redondeo ---------- */
const TRM_FUENTE = "TRM certificada por la Superintendencia Financiera de Colombia";
const isInt = (dest) => D[dest].amb === "int";
// HU-15: redondeo a la unidad de peso, sin decimales; 0,5 o más sube. Se usa en toda la app.
const redondear = (x) => Math.round(Number(x.toFixed(6)));
// Solo para el sprint review: #/...?simular=tasa-nueva | sin-tasa | normal
const simulacion = () => store.get("simular", "normal");

// HU-19: la tasa se consulta una vez al día y cada consulta queda registrada
function trmDelDia() {
  if (simulacion() === "sin-tasa") return null;
  const t = today();
  const d = pD(t);
  const n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  let valor = 3980.25 + ((n * 13) % 45); // demo: valor simulado que cambia cada día
  if (simulacion() === "tasa-nueva") valor += 49.75;
  const reg = store.get("consultasTRM", []);
  let r = reg.find((x) => x.fecha === t && x.valor === valor);
  if (!r) {
    const ahora = new Date();
    r = {
      fecha: t,
      hora: String(ahora.getHours()).padStart(2, "0") + ":" + String(ahora.getMinutes()).padStart(2, "0"),
      valor,
      fuente: TRM_FUENTE,
    };
    store.set("consultasTRM", reg.concat(r).slice(-60));
  }
  return r;
}
const usd = (n) => "US$ " + Math.round(n).toLocaleString("de-DE");
const tasaTxt = (v) => {
  const [e, dcm] = v.toFixed(2).split(".");
  return "$" + e.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + dcm;
};
const horaTxt = (h) => {
  const [H, M] = h.split(":").map(Number);
  return (H % 12 || 12) + ":" + String(M).padStart(2, "0") + (H < 12 ? " a. m." : " p. m.");
};
// Precio de un destino: nacional en pesos; internacional en dólares con su equivalente en pesos (HU-14)
function precioHTML(monto, dest, cls) {
  if (!isInt(dest)) return '<b class="' + (cls || "") + '">' + money(monto) + "</b>";
  const t = trmDelDia();
  return (
    '<b class="' +
    (cls || "") +
    '">' +
    usd(monto) +
    '</b><span class="cop">' +
    (t ? "≈ " + money(redondear(monto * t.valor)) + " COP" : "Conversión no disponible en este momento") +
    "</span>"
  );
}

/* ---------- HU-20: falla de conexión con la base de datos ---------- */
// La demo no tiene base de datos real: el botón "Simular falla de la base de datos" activa este estado
const falloBD = () => store.get("falloBD", false);
function falloBDHTML() {
  return (
    '<div class="fallo-bd" role="alert"><b>No pudimos cargar la información en este momento.</b>' +
    "<p>Revisa tu conexión e intenta de nuevo.</p>" +
    '<button type="button" class="btn btn-go" data-act="reintentar">Reintentar</button></div>'
  );
}
function demoBD() {
  return (
    '<div class="demo-tools"><span>Prueba de la demo:</span>' +
    (falloBD()
      ? '<button type="button" class="btn btn-text" data-act="bd" data-v="0">Volver a la normalidad</button>'
      : '<button type="button" class="btn btn-text" data-act="bd" data-v="1">Simular falla de la base de datos</button>') +
    "</div>"
  );
}

/* ---------- pricing ---------- */
// Los paquetes internacionales se calculan en dólares y se pasan a pesos con la tasa indicada
// (por defecto, la tasa del día). Impuestos y descuento siempre en pesos.
function calc(dr, tasa) {
  const p = P[dr.pkg];
  const intl = isInt(p.dest);
  let pp = p.price;
  if (p.hotel && dr.hotel && dr.hotel !== p.hotel) {
    const diff = ((H[dr.hotel].nightly - H[p.hotel].nightly) * p.nights) / 2;
    pp += intl ? redondear(diff) : Math.round(diff / 1000) * 1000;
  }
  if (p.hotel) pp += ROOMS[dr.room || "std"][intl ? 2 : 1] * p.nights;
  const subFx = pp * dr.travelers;
  let rate = 1;
  if (intl) {
    const t = trmDelDia();
    rate = tasa !== undefined ? tasa : t && t.valor;
    if (!rate) return { intl, pp, subFx, sinTasa: true };
  }
  const sub = intl ? redondear(subFx * rate) : subFx;
  const tax = Math.round((sub * 0.075) / 1000) * 1000;
  const disc = sub >= 1500000 ? 120000 : 0;
  return { intl, pp, subFx, rate, ppCop: intl ? redondear(pp * rate) : pp, sub, tax, disc, total: sub + tax - disc };
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
  // HU-16: se cobra con la tasa que el usuario aceptó; el total en pesos queda fijo en la reserva
  const c = calc(dr, isInt(p.dest) ? dr.tasa : undefined);
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
