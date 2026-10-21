/* Airsoft · Componentes compartidos: avisos, encabezado y buscador */
"use strict";

/* ---------- ui helpers ---------- */
let tT;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(tT);
  tT = setTimeout(() => t.classList.remove("show"), 3400);
}
function go(h) {
  if (location.hash === h) route();
  else location.hash = h;
}
function stars(n) {
  return (
    '<span class="stars" aria-label="' +
    n +
    ' estrellas">' +
    "★".repeat(n) +
    "☆".repeat(5 - n) +
    "</span>"
  );
}
function setErr(form, name, msg) {
  const el = form.querySelector('[data-err="' + name + '"]');
  if (el) el.textContent = msg || "";
  const inp = form.querySelector('[name="' + name + '"]');
  if (inp) inp.classList.toggle("bad", !!msg);
}
function clearErrs(form) {
  $$("[data-err]", form).forEach((e) => (e.textContent = ""));
  $$(".bad", form).forEach((e) => e.classList.remove("bad"));
}
function matchDest(txt) {
  const n = norm(txt).split(",")[0];
  if (!n) return null;
  return (
    DEST.find((d) => norm(d.name) === n) ||
    DEST.find((d) => norm(d.name).startsWith(n)) ||
    DEST.find((d) => norm(d.code) === n) ||
    null
  );
}
function qr(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h = h || 1;
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
  let r = "";
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
      if (rnd() > 0.52) r += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
  const f = (x, y) =>
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="7" height="7"/><rect x="' +
    (x + 1) +
    '" y="' +
    (y + 1) +
    '" width="5" height="5" fill="#fff"/><rect x="' +
    (x + 2) +
    '" y="' +
    (y + 2) +
    '" width="3" height="3"/>';
  return (
    '<svg viewBox="0 0 21 21" width="72" height="72" fill="#14171F" shape-rendering="crispEdges" aria-hidden="true">' +
    r +
    f(0, 0) +
    f(14, 0) +
    f(0, 14) +
    "</svg>"
  );
}

/* ---------- header ---------- */
function header(r) {
  const u = me();
  const on = (k) => (r === k ? ' class="on"' : "");
  $("#top").innerHTML =
    '<div class="container"><a class="brand" href="#/"><img src="' +
    LOGO +
    '" alt="">AIRSOFT</a>' +
    '<button class="burger" data-act="menu" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span><span></span></button>' +
    '<nav class="nav" aria-label="Principal"><a href="#/"' +
    on("") +
    '>Inicio</a><a href="#/destinos"' +
    on("destinos") +
    '>Destinos</a><a href="#/resultados"' +
    (r === "resultados" || r === "paquete" || r === "hoteles" ? ' class="on"' : "") +
    '>Paquetes</a><a href="#/nosotros"' +
    (r === "nosotros" || r === "trabaja" ? ' class="on"' : "") +
    '>Nosotros</a><a href="#/contacto"' +
    on("contacto") +
    ">Contacto</a></nav>" +
    '<div class="actions">' +
    (u
      ? '<span class="hi">Hola, ' +
        esc(u.nombre) +
        '</span><a class="btn btn-text" href="#/mis-reservas">Mis reservas</a><button class="btn btn-ghost" data-act="logout">Salir</button>'
      : '<a class="btn btn-text" href="#/login">Iniciar sesión</a><a class="btn btn-go" href="#/registro">Regístrate</a>') +
    "</div></div>";
}

/* ---------- search form ---------- */
function searchForm() {
  const s = S.search;
  const dl = s.dest ? D[s.dest].name + ", " + D[s.dest].country : "";
  return (
    '<form class="search" data-form="search" novalidate>' +
    '<div class="field"><label for="s-o">Origen</label><select id="s-o" name="origin" class="input">' +
    Object.entries(ORIG)
      .map(
        ([k, v]) =>
          '<option value="' +
          k +
          '"' +
          (k === s.origin ? " selected" : "") +
          ">" +
          v +
          " (" +
          k +
          ")</option>",
      )
      .join("") +
    "</select></div>" +
    '<div class="field"><label for="s-d">Destino</label><input id="s-d" name="dest" class="input" list="dl-dest" placeholder="¿A dónde vamos?" autocomplete="off" value="' +
    esc(dl) +
    '"><datalist id="dl-dest">' +
    DEST.map((d) => '<option value="' + esc(d.name + ", " + d.country) + '">').join("") +
    "</datalist></div>" +
    '<div class="field dfield"><label for="s-i">Fechas</label><div class="dates"><input id="s-i" type="date" name="start" class="input" aria-label="Fecha de ida" min="' +
    today() +
    '" value="' +
    s.start +
    '"><input type="date" name="end" class="input" aria-label="Fecha de regreso" min="' +
    today() +
    '" value="' +
    s.end +
    '"></div></div>' +
    '<div class="field"><label for="s-v">Viajeros</label><select id="s-v" name="travelers" class="input">' +
    [1, 2, 3, 4, 5, 6]
      .map(
        (n) =>
          '<option value="' +
          n +
          '"' +
          (n === s.travelers ? " selected" : "") +
          ">" +
          plural(n, "adulto", "adultos") +
          "</option>",
      )
      .join("") +
    "</select></div>" +
    '<button class="btn btn-go" type="submit">Buscar</button><div class="ferr" data-err="form" role="alert"></div></form>'
  );
}
