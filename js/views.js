/* Airsoft · Vistas: una función por pantalla (historias de usuario) */
"use strict";

/* ---------- views ---------- */
function minPkg(dest) {
  const l = PKGS.filter((p) => p.dest === dest && p.hotel);
  return l.reduce((a, b) => (b.price < a.price ? b : a), l[0]);
}
function destCard(d) {
  const m = minPkg(d.id);
  return (
    '<button class="dest" data-act="dest" data-id="' +
    d.id +
    '"><div class="ph" style="background:' +
    d.grad +
    '"><b>' +
    esc(d.name) +
    "</b><small>" +
    esc(d.country) +
    '</small></div><div class="meta">' +
    PLAN[m.plan] +
    " · " +
    plural(m.nights, "noche", "noches") +
    '</div><div class="from">Desde ' +
    precioHTML(m.price, d.id) +
    "</div></button>"
  );
}

function vHome() {
  const u = me();
  return {
    title: "Airsoft · Agencia de viajes",
    html:
      '<section class="sky"><div class="container hero"><div class="kicker">VIAJA. EXPLORA. VIVE.</div><h1>Tu próximo viaje empieza con una búsqueda</h1><p>Vuelos, hoteles y paquetes todo incluido a destinos nacionales e internacionales, armados a tu manera.</p>' +
      searchForm() +
      "</div></section>" +
      '<section class="section"><div class="container"><div class="sec-head"><div><h2>Destinos populares</h2><p class="sub">Los planes que más está reservando la comunidad Airsoft</p></div><a class="btn btn-ghost" href="#/destinos">Ver todos los destinos</a></div><h3 class="dest-sub">Nacionales</h3><div class="dest-grid">' +
      DEST.filter((d) => d.pop && d.amb === "nac")
        .map(destCard)
        .join("") +
      '</div><h3 class="dest-sub">Internacionales <small>precios en dólares con su equivalente en pesos</small></h3><div class="dest-grid">' +
      DEST.filter((d) => d.pop && d.amb === "int")
        .map(destCard)
        .join("") +
      "</div></div></section>" +
      '<section class="section" style="padding-top:0"><div class="container"><h2 class="h2" style="margin-bottom:26px">¿Por qué viajar con Airsoft?</h2><div class="why">' +
      "<div><h3>Precios claros por persona</h3></div>" +
      "<div><h3>Soporte antes y durante el viaje</h3></div>" +
      "<div><h3>Paquetes flexibles</h3></div></div></div></section>" 
      
  };
}

function vDestinos(q) {
  const reg = q.get("region");
  const list = DEST.filter((d) => !reg || d.region === reg);
  const regs = ["Colombia", "Caribe", "Norteamérica", "Centroamérica", "Suramérica", "Europa"];
  return {
    title: "Destinos · Airsoft",
    html:
      '<section class="sky"><div class="container page-sky"><h1>' +
      (reg ? "Destinos en " + esc(reg) : "Todos los destinos") +
      "</h1><p>Escoge un destino y te mostramos los paquetes disponibles para tus fechas.</p><a class=\"btn btn-white\" href=\"#/agencias\" style=\"margin-top:18px\">Buscar agencias por país</a></div></section>" +
      '<section class="section"><div class="container"><div class="chips" style="margin-bottom:24px"><a class="chip' +
      (reg ? "" : " on") +
      '" href="#/destinos" style="text-decoration:none">Todos</a>' +
      regs
        .map(
          (r) =>
            '<a class="chip' +
            (reg === r ? " on" : "") +
            '" href="#/destinos?region=' +
            encodeURIComponent(r) +
            '" style="text-decoration:none">' +
            r +
            "</a>",
        )
        .join("") +
      '</div><div class="dest-grid">' +
      list.map(destCard).join("") +
      "</div></div></section>",
  };
}

/* results */
function resetF() {
  return { min: null, max: null, plans: [], stars: [], airs: [], sort: "rec" };
}
function resultBase() {
  const s = S.search;
  return PKGS.filter(
    (p) =>
      D[p.dest].amb === s.amb &&
      (!s.pais || D[p.dest].country === s.pais) &&
      (!s.dest || p.dest === s.dest) &&
      (!s.ag || p.ag === s.ag),
  );
}
// montos en la moneda de la búsqueda: pesos (nacional) o dólares (internacional)
const fmtBase = (n) => (S.search.amb === "int" ? usd(n) : money(n));
function destinoTxt() {
  const s = S.search;
  if (s.dest) return esc(D[s.dest].name) + (s.amb === "int" ? ", " + esc(D[s.dest].country) : "");
  if (s.amb === "int") return s.pais ? esc(s.pais) : "Destinos internacionales";
  return "Destinos nacionales";
}
// HU-14 y HU-19: recuadro con la tasa del día en las búsquedas internacionales
function tasaBox() {
  const t = trmDelDia();
  return t
    ? '<div class="tasa">Tasa del día: US$ 1 = ' + tasaTxt(t.valor) + " COP · " + fDay(t.fecha) + "</div>"
    : '<div class="tasa off">Tasa del día no disponible: por ahora no mostramos el valor en pesos.</div>';
}
function vResults(q) {
  if (q.has("destino")) {
    const d = D[q.get("destino")];
    S.search.dest = d ? d.id : "";
    S.search.amb = d ? d.amb : "nac";
    S.search.pais = d && d.amb === "int" ? d.country : "";
    S.search.ag = "";
    saveSearch();
    F = resetF();
    history.replaceState(null, "", "#/resultados");
  }
  if (!F) F = resetF();
  const base = resultBase();
  const step = S.search.amb === "int" ? 50 : 100000;
  const lo = base.length ? Math.floor(Math.min(...base.map((p) => p.price)) / step) * step : 0;
  const hi = base.length ? Math.ceil(Math.max(...base.map((p) => p.price)) / step) * step : step;
  if (F.min == null || F.min < lo || F.min > hi) F.min = lo;
  if (F.max == null || F.max > hi || F.max < lo) F.max = hi;
  const plans = [...new Set(base.map((p) => p.plan))],
    st = [...new Set(base.filter((p) => p.hotel).map((p) => H[p.hotel].stars))].sort(),
    airs = [...new Set(base.map((p) => p.air))];
  const chip = (grp, val, label, sel) =>
    '<button type="button" class="chip' +
    (sel.includes(val) ? " on" : "") +
    '" data-act="fchip" data-g="' +
    grp +
    '" data-v="' +
    esc(val) +
    '" aria-pressed="' +
    sel.includes(val) +
    '">' +
    esc(label) +
    "</button>";
  return {
    title: "Paquetes · Airsoft",
    after: () => {
      syncRange("#prange", lo, hi);
      openFilters();
    },
    html:
      '<div class="bar"><div class="container"><p class="bar-sum">' +
      ORIG[S.search.origin] +
      " → " +
      destinoTxt() +
      " · " +
      fRange(S.search.start, S.search.end) +
      " · " +
      plural(S.search.travelers, "adulto", "adultos") +
      (S.search.ag ? " · Ofertas de " + esc(AG[S.search.ag].nombre) : "") +
      "</p></div></div>" +
      '<div class="container layout"><details class="filters" open><summary>Filtrar resultados</summary><h3>Filtrar resultados</h3>' +
      '<div class="fgroup"><h4>Rango de precio</h4><div class="range" id="prange"><div class="track"></div><div class="fill"></div><input type="range" aria-label="Precio mínimo" min="' +
      lo +
      '" max="' +
      hi +
      '" step="' +
      step +
      '" value="' +
      F.min +
      '" data-range="min"><input type="range" aria-label="precio máximo" min="' +
      lo +
      '" max="' +
      hi +
      '" step="' +
      step +
      '" value="' +
      F.max +
      '" data-range="max"></div><div class="rl"><span id="rmin">' +
      fmtBase(F.min) +
      '</span><span id="rmax">' +
      fmtBase(F.max) +
      "</span></div></div>" +
      '<div class="fgroup"><h4>Tipo de plan</h4><div class="chips">' +
      plans.map((v) => chip("plans", v, PLAN[v], F.plans)).join("") +
      "</div></div>" +
      (st.length
        ? '<div class="fgroup"><h4>Calificación del hotel</h4><div class="chips">' +
          st.map((v) => chip("stars", String(v), v + "★", F.stars)).join("") +
          "</div></div>"
        : "") +
      '<div class="fgroup"><h4>Aerolínea</h4><div class="chips">' +
      airs.map((v) => chip("airs", v, v, F.airs)).join("") +
      "</div></div>" +
      '</details><section aria-live="polite"><div class="lhead"><span class="count" id="rcount"></span>' +
      (S.search.amb === "int" ? tasaBox() : "") +
      '<label class="sr" for="rsort">Ordenar</label><select id="rsort" class="sort" data-act="rsort"><option value="rec">Ordenar: Recomendados</option><option value="asc">Ordenar: Menor precio</option><option value="desc">Ordenar: Mayor precio</option><option value="dur">Ordenar: Más noches</option></select></div><div id="rlist"></div></section></div>',
  };
}
function filteredPkgs() {
  const sn = daysBetween(S.search.start, S.search.end);
  let l = resultBase().filter(
    (p) =>
      p.price >= F.min &&
      p.price <= F.max &&
      (!F.plans.length || F.plans.includes(p.plan)) &&
      (!F.stars.length || (p.hotel && F.stars.includes(String(H[p.hotel].stars)))) &&
      (!F.airs.length || F.airs.includes(p.air)),
  );
  const s = F.sort;
  l.sort((a, b) =>
    s === "asc"
      ? a.price - b.price
      : s === "desc"
        ? b.price - a.price
        : s === "dur"
          ? b.nights - a.nights
          : (a.nights === sn ? 0 : 1) - (b.nights === sn ? 0 : 1) ||
            (a.plan === "vuelo") - (b.plan === "vuelo") ||
            b.price - a.price,
  );
  return l;
}
function renderResultList() {
  const l = filteredPkgs();
  const d = S.search.dest ? D[S.search.dest] : null;
  const o = S.search.origin;
  $("#rcount").textContent =
    plural(l.length, "paquete encontrado", "paquetes encontrados") +
    (d ? " a " + d.name + (d.amb === "int" ? ", " + d.country : "") : S.search.pais ? " a " + S.search.pais : "");
  const sel = $("#rsort");
  if (sel) sel.value = F.sort;
  $("#rlist").innerHTML = l.length
    ? l
        .map((p, i) => {
          const dd = D[p.dest];
          const st = addDays(S.search.start, p.off);
          return (
            '<article class="row"><div class="thumb" style="background:' +
            (d ? GRADS[i % 4] : dd.grad) +
            '">' +
            esc(dd.name) +
            "</div><div>" +
            (dd.amb === "int" ? '<p class="pais">📍 ' + esc(dd.country) + "</p>" : "") +
            "<h3>" +
            ORIG[o] +
            " (" +
            o +
            ") → " +
            esc(dd.name) +
            " (" +
            dd.code +
            ')</h3><p class="m">' +
            fRange(st, addDays(st, p.nights)) +
            " · " +
            plural(p.nights, "noche", "noches") +
            " · " +
            (p.direct ? "Vuelo directo" : "1 escala") +
            " · " +
            esc(p.air) +
            '</p><div class="tags"><span class="tag">' +
            PLAN[p.plan] +
            "</span>" +
            (p.hotel
              ? '<span class="tag">' + H[p.hotel].stars + "★</span>"
              : '<span class="tag soft">Equipaje de mano incluido</span>') +
            "</div></div>" +
            '<div class="price">' +
            precioHTML(p.price, p.dest) +
            "<small>por persona" +
            (dd.amb === "int" && trmDelDia() ? " · Tasa del día " + fDay(today(), false) : "") +
            '</small><button class="btn btn-go" data-act="open-pkg" data-id="' +
            p.id +
            '">' +
            (p.hotel ? "Elegir hotel" : "Ver paquete") +
            "</button></div></article>"
          );
        })
        .join("")
    : '<div class="empty">No encontramos paquetes con estos filtros.<br><button class="btn btn-ghost" data-act="fclear">Limpiar filtros</button></div>';
}
function syncRange(sel, lo, hi) {
  const r = $(sel);
  if (!r) return;
  const [a, b] = $$("input", r);
  const f = $(".fill", r);
  const pct = (v) => ((v - lo) / (hi - lo || 1)) * 100;
  f.style.left = pct(+a.value) + "%";
  f.style.right = 100 - pct(+b.value) + "%";
}
function openFilters() {
  const d = $(".filters");
  if (d) d.open = window.innerWidth > 860;
}

/* detail */
function ensureDraft(id) {
  if (!S.draft || S.draft.pkg !== id) {
    const p = P[id];
    let st = addDays(S.search.start, p.off);
    if (st < today()) st = addDays(today(), 14);
    S.draft = {
      pkg: id,
      origin: S.search.origin,
      start: st,
      travelers: S.search.travelers,
      room: "std",
      hotel: null, // HU-05: ningún hotel viene seleccionado por defecto
    };
    saveDraft();
  }
}
function includes(p, h, o) {
  const d = D[p.dest];
  const L = [];
  L.push("Vuelo ida y vuelta " + ORIG[o] + " – " + d.name);
  if (p.hotel && !h) L.push("🏨 " + plural(p.nights, "noche", "noches") + " en el hotel que elijas");
  if (h)
    L.push(
      "🏨 " +
        plural(p.nights, "noche", "noches") +
        " en hotel " +
        h.stars +
        "★" +
        (h.amen.includes(A_MAR) ? " frente al mar" : ""),
    );
  if (p.plan === "todo") {
    L.push(
      " Plan todo incluido (desayuno, almuerzo, cena)",
      " Traslados aeropuerto – hotel – aeropuerto",
      " Equipaje de bodega y de mano",
      " Asistencia médica en viaje",
    );
  } else if (p.plan === "vh") {
    if (h && h.amen.includes(A_DES)) L.push("🥐 Desayuno incluido");
    L.push("🧳 Equipaje de mano (10 kg)", "🛟 Asistencia médica en viaje");
  } else
    L.push(
      " Equipaje de mano (10 kg)",
      " Silla estándar asignada",
      " Un cambio de fecha con costo",
    );
  return L;
}
function itin(p) {
  const base = ITIN[p.dest];
  const n = p.nights;
  const k = Math.min(3, n - 1);
  const out = base.slice(0, k).map((it, i) => [String(i + 1), it[0], it[1]]);
  if (n > k)
    out.push([
      k + 1 === n ? String(n) : k + 1 + "–" + n,
      "Días libres",
      "Tiempo para descansar o sumar actividades opcionales.",
    ]);
  return out;
}
// Botones para el sprint review: simulan que el dólar sube o que la TRM no responde (HU-16 y HU-19)
function demoTasa(opc) {
  const sim = simulacion();
  const b = (v, l) => '<button type="button" class="btn btn-text" data-act="sim" data-v="' + v + '">' + l + "</button>";
  return (
    '<div class="demo-tools"><span>Prueba de la demo:</span>' +
    (opc.includes("tasa-nueva") && sim !== "tasa-nueva" ? b("tasa-nueva", "Simular que el dólar subió") : "") +
    (opc.includes("sin-tasa") && sim !== "sin-tasa" ? b("sin-tasa", "Simular que la TRM no responde") : "") +
    (sim !== "normal" ? b("normal", "Volver a la tasa normal") : "") +
    "</div>"
  );
}
// HU-15 y HU-19: equivalente en pesos con la tasa del día, su fecha y su fuente
function tasaPanel(t, c) {
  if (!t)
    return '<p class="cop-big off">Conversión no disponible en este momento</p><div class="tasa-box off">No pudimos consultar la tasa del día. Por ahora no mostramos el valor en pesos ni se puede confirmar la reserva. Intenta de nuevo en unos minutos.</div>';
  return (
    '<p class="cop-big">≈ ' +
    money(c.ppCop) +
    " COP</p>" +
    '<div class="tasa-box">Tasa del día: US$ 1 = ' +
    tasaTxt(t.valor) +
    " · " +
    fDay(t.fecha) +
    "<br><small>Fuente: " +
    esc(t.fuente) +
    ". Consultada a las " +
    horaTxt(t.hora) +
    " El precio en pesos queda fijo cuando confirmas la reserva.</small></div>"
  );
}
// HU-17: requisitos de viaje para viajeros colombianos (solo destinos internacionales)
function requisitosHTML(d) {
  const r = REQS[d.country];
  if (!r) return "";
  const fila = (k, v) =>
    '<div class="req-row"><span>' + k + '</span><b class="' + (v.startsWith("No") ? "no" : "si") + '">' + esc(v) + "</b></div>";
  return (
    '<div class="dsec"><h2>Requisitos de viaje</h2><div class="req"><p class="sub">Para viajeros con pasaporte colombiano que viajan a ' +
    esc(d.country) +
    "</p>" +
    fila("Pasaporte vigente", r.pasaporte) +
    fila("Visa", r.visa) +
    '<div class="req-warn">Información orientativa; verifica con la embajada o consulado del país.</div><p class="note">Fuente: Cancillería de Colombia · Última revisión: ' +
    fDay(REQ_REVISION) +
    "</p></div></div>"
  );
}
function vDetail(id) {
  const p = P[id];
  if (!p) return vNotFound();
  ensureDraft(id);
  const dr = S.draft;
  const h = dr.hotel ? H[dr.hotel] : null;
  const d = D[p.dest];
  const intl = d.amb === "int";
  const t = intl ? trmDelDia() : null;
  // HU-16: se guarda la tasa con la que el usuario vio el precio
  if (intl && t && dr.tasa !== t.valor) {
    dr.tasa = t.valor;
    saveDraft();
  }
  const c = calc(dr);
  const end = addDays(dr.start, p.nights);
  return {
    title: pkgTitle(p) + " · Airsoft",
    html:
      '<section class="dhero" style="background:' +
      d.grad +
      '"><div class="container"><h1>' +
      esc(pkgTitle(p)) +
      "</h1><p>" +
      (h ? esc(h.where) + " · " : "") +
      (p.direct ? "Vuelo directo" : "Vuelo con 1 escala") +
      " desde " +
      ORIG[dr.origin] +
      " · " +
      esc(p.air) +
      (h ? " · Hotel " + h.stars + "★" : "") +
      "</p></div></section>" +
      '<div class="container dlayout"><div><div class="gallery" aria-hidden="true"><div style="background:' +
      d.grad +
      '"></div><div style="background:' +
      GRADS[1] +
      '"></div><div style="background:' +
      GRADS[2] +
      '"></div><div style="background:' +
      GRADS[3] +
      '"></div><div style="background:linear-gradient(135deg,#8FE3C8,#4D6FFF)"></div></div>' +
      '<div class="dsec"><h2>Qué incluye</h2><div class="inc">' +
      includes(p, h, dr.origin)
        .map((t) => "<div>" + esc(t) + "</div>")
        .join("") +
      "</div></div>" +
      (h
        ? '<div class="dsec"><h2>Tu hotel</h2><div class="hbox"><div><b>' +
          esc(h.name) +
          "</b><p>" +
          esc(h.where) +
          " · " +
          stars(h.stars) +
          '</p><div class="tags">' +
          h.amen.map((a) => '<span class="tag soft">' + a + "</span>").join("") +
          '</div></div><a class="btn btn-ghost" href="#/hoteles?pkg=' +
          p.id +
          '">Cambiar hotel</a></div></div>'
        : p.hotel
          ? '<div class="dsec"><h2>Tu hotel</h2><div class="hbox"><div><b>Todavía no has elegido hotel</b><p>Elige el hotel antes de confirmar tu reserva.</p></div><a class="btn btn-go" href="#/hoteles?pkg=' +
            p.id +
            '">Elegir hotel</a></div></div>'
          : "") +
      (p.plan !== "vuelo"
        ? '<div class="dsec"><h2>Itinerario sugerido</h2><ol class="itin">' +
          itin(p)
            .map(
              ([n, t, x]) =>
                "<li><i>" +
                n +
                "</i><div><b>" +
                esc(t) +
                "</b><span>" +
                esc(x) +
                "</span></div></li>",
            )
            .join("") +
          "</ol></div>"
        : "") +
      (intl ? requisitosHTML(d) : "") +
      '</div><aside class="book"><div class="big">' +
      (intl ? usd(c.pp) : money(c.pp)) +
      " <small>/ por persona</small></div>" +
      (intl ? tasaPanel(t, c) : "") +
      '<div class="stack" style="margin-top:18px"><div class="field"><label for="b-s">Fecha de salida</label><input id="b-s" type="date" class="input" data-draft="start" min="' +
      today() +
      '" value="' +
      dr.start +
      '"><div class="note" style="margin-top:6px">Regresas el ' +
      fDay(end) +
      " · " +
      plural(p.nights, "noche", "noches") +
      "</div></div>" +
      '<div class="field"><label for="b-t">Viajeros</label><select id="b-t" class="input" data-draft="travelers">' +
      [1, 2, 3, 4, 5, 6]
        .map(
          (n) =>
            '<option value="' +
            n +
            '"' +
            (n === dr.travelers ? " selected" : "") +
            ">" +
            plural(n, "adulto", "adultos") +
            "</option>",
        )
        .join("") +
      "</select></div>" +
      (p.hotel
        ? '<div class="field"><label for="b-r">Habitación</label><select id="b-r" class="input" data-draft="room">' +
          Object.entries(ROOMS)
            .map(
              ([k, [n, x, u]]) =>
                '<option value="' +
                k +
                '"' +
                (k === dr.room ? " selected" : "") +
                ">" +
                n +
                (intl ? (u ? " (+" + usd(u) + " por noche)" : "") : x ? " (+" + money(x) + " por noche)" : "") +
                "</option>",
            )
            .join("") +
          "</select></div>"
        : "") +
      '</div><div style="margin:16px 0 14px"><div class="line"><span>Total ' +
      plural(dr.travelers, "viajero", "viajeros") +
      (intl ? " (" + usd(c.subFx) + ")" : "") +
      "</span><b>" +
      (c.sinTasa ? "No disponible" : money(c.sub)) +
      '</b></div><div class="line"><span>Impuestos y tasas</span><span>' +
      (c.sinTasa ? "No disponible" : money(c.tax)) +
      "</span></div></div>" +
      '<button class="btn btn-go btn-block" data-act="reserve"' +
      (c.sinTasa ? " disabled" : "") +
      '>Reservar ahora</button><div class="err" id="b-err"></div>' +
      (intl ? demoTasa(["sin-tasa"]) : "") +
      "</aside></div>",
  };
}

/* hotels */
function resetHF() {
  return { min: null, max: null, stars: [], amen: [], zones: [], sort: "rating" };
}
function vHotels(q) {
  let dest = q.get("destino");
  const pk = q.get("pkg");
  if (pk && P[pk]) {
    ensureDraft(pk);
    dest = P[pk].dest;
  }
  if (!dest) dest = (S.draft && P[S.draft.pkg].dest) || S.search.dest || "ctg";
  if (!D[dest]) dest = "ctg";
  if (!S.hsearch || S.hsearch.dest !== dest) {
    const st = S.draft && P[S.draft.pkg].dest === dest ? S.draft.start : S.search.start;
    const n =
      S.draft && P[S.draft.pkg].dest === dest
        ? P[S.draft.pkg].nights
        : daysBetween(S.search.start, S.search.end);
    S.hsearch = {
      dest,
      in: st,
      out: addDays(st, n),
      guests: S.draft ? S.draft.travelers : S.search.travelers,
    };
    HF = resetHF();
  }
  if (!HF) HF = resetHF();
  const hs = S.hsearch;
  const base = HOT.filter((h) => h.dest === dest);
  const hst = isInt(dest) ? 10 : 50000;
  const lo = Math.floor(Math.min(...base.map((h) => h.nightly)) / hst) * hst,
    hi = Math.ceil(Math.max(...base.map((h) => h.nightly)) / hst) * hst;
  if (HF.min == null || HF.min < lo) HF.min = lo;
  if (HF.max == null || HF.max > hi) HF.max = hi;
  const st = [...new Set(base.map((h) => h.stars))].sort(),
    am = [...new Set(base.flatMap((h) => h.amen))],
    zs = [...new Set(base.map((h) => h.zone))];
  const chip = (g, v, l, sel) =>
    '<button type="button" class="chip' +
    (sel.includes(v) ? " on" : "") +
    '" data-act="hchip" data-g="' +
    g +
    '" data-v="' +
    esc(v) +
    '" aria-pressed="' +
    sel.includes(v) +
    '">' +
    esc(l) +
    "</button>";
  return {
    title: "Hoteles en " + D[dest].name + " · Airsoft",
    after: () => {
      syncRange("#hrange", lo, hi);
      openFilters();
    },
    html:
      '<div class="bar"><div class="container"><p class="bar-sum">Elige tu hotel en ' +
      esc(D[dest].name) +
      " · " +
      fRange(hs.in, hs.out) +
      " · " +
      plural(hs.guests, "adulto", "adultos") +
      "</p></div></div>" +
      '<div class="container layout"><details class="filters" open><summary>Filtrar hoteles</summary><h3>Filtrar hoteles</h3>' +
      '<div class="fgroup"><h4>Precio por noche</h4><div class="range" id="hrange"><div class="track"></div><div class="fill"></div><input type="range" aria-label="Precio mínimo por noche" min="' +
      lo +
      '" max="' +
      hi +
      '" step="' +
      (isInt(dest) ? 5 : 10000) +
      '" value="' +
      HF.min +
      '" data-hrange="min"><input type="range" aria-label="Precio máximo por noche" min="' +
      lo +
      '" max="' +
      hi +
      '" step="' +
      (isInt(dest) ? 5 : 10000) +
      '" value="' +
      HF.max +
      '" data-hrange="max"></div><div class="rl"><span id="hmin">' +
      (isInt(dest) ? usd(HF.min) : money(HF.min)) +
      '</span><span id="hmax">' +
      (isInt(dest) ? usd(HF.max) : money(HF.max)) +
      "</span></div></div>" +
      '<div class="fgroup"><h4>Calificación</h4><div class="chips">' +
      st.map((v) => chip("stars", String(v), v + "★", HF.stars)).join("") +
      "</div></div>" +
      '<div class="fgroup"><h4>Servicios</h4><div class="chips">' +
      am.map((v) => chip("amen", v, v, HF.amen)).join("") +
      "</div></div>" +
      '<div class="fgroup"><h4>Zona</h4><div class="chips">' +
      zs.map((v) => chip("zones", v, v, HF.zones)).join("") +
      "</div></div>" +
      '</details><section aria-live="polite"><div class="lhead"><span class="count" id="hcount"></span><label class="sr" for="hsort">Ordenar</label><select id="hsort" class="sort" data-act="hsort"><option value="rating">Ordenar: Mejor calificados</option><option value="asc">Ordenar: Menor precio</option><option value="desc">Ordenar: Mayor precio</option></select></div><div id="hlist"></div></section></div>',
  };
}
function renderHotelList() {
  const hs = S.hsearch;
  const n = Math.max(1, daysBetween(hs.in, hs.out));
  const rooms = hs.guests > 2 ? Math.ceil(hs.guests / 2) : 1;
  let l = HOT.filter(
    (h) =>
      h.dest === hs.dest &&
      h.nightly >= HF.min &&
      h.nightly <= HF.max &&
      (!HF.stars.length || HF.stars.includes(String(h.stars))) &&
      HF.amen.every((a) => h.amen.includes(a)) &&
      (!HF.zones.length || HF.zones.includes(h.zone)),
  );
  l.sort((a, b) =>
    HF.sort === "asc"
      ? a.nightly - b.nightly
      : HF.sort === "desc"
        ? b.nightly - a.nightly
        : b.stars - a.stars || b.nightly - a.nightly,
  );
  $("#hcount").textContent =
    plural(l.length, "hotel disponible", "hoteles disponibles") + " en " + D[hs.dest].name;
  $("#hsort").value = HF.sort;
  const cur = S.draft && P[S.draft.pkg].dest === hs.dest ? S.draft.hotel : null;
  $("#hlist").innerHTML = l.length
    ? l
        .map(
          (h, i) =>
            '<article class="row"><div class="thumb" style="background:' +
            GRADS[i % 4] +
            '"></div><div><h3>' +
            esc(h.name) +
            '</h3><p class="m">' +
            esc(h.where) +
            " · " +
            stars(h.stars) +
            '</p><div class="tags">' +
            h.amen.map((a) => '<span class="tag soft">' + a + "</span>").join("") +
            "</div></div>" +
            '<div class="price">' +
            precioHTML(h.nightly, h.dest) +
            "<small>por noche · " +
            (isInt(h.dest) ? usd(h.nightly * n * rooms) : money(h.nightly * n * rooms)) +
            " en total</small>" +
            (cur === h.id
              ? '<button class="btn btn-ghost" data-act="pick-hotel" data-id="' +
                h.id +
                '">Seleccionado ✓</button>'
              : '<button class="btn btn-go" data-act="pick-hotel" data-id="' +
                h.id +
                '">Seleccionar</button>') +
            "</div></article>",
        )
        .join("")
    : '<div class="empty">Ningún hotel cumple con los filtros ingresados.<br><button class="btn btn-ghost" data-act="hclear">Limpiar filtros</button></div>';
}

/* auth */
function vAuth(mode, q) {
  const next = q.get("next") || "";
  const nx = next.startsWith("#/") ? next : "";
  if (me()) {
    return { redirect: nx || "#/" };
  }
  const reg = mode === "registro";
  const left =
    '<div class="sky"><div style="position:relative;z-index:1"><div class="kicker">' +
    (reg ? "CUENTA AIRSOFT" : "BIENVENIDO DE VUELTA") +
    "</div><h1>" +
    (reg ? "Crea tu cuenta y guarda tus viajes favoritos" : "Tus reservas te están esperando") +
    '</h1></div><div class="quote">Reserva todo tu viaje en 10 minutos, sin llamadas ni filas</div></div>';
  const form = reg
    ? '<form data-form="register" data-next="' +
      esc(nx) +
      '" novalidate><h1>Crea tu cuenta</h1><p class="sub" style="margin-bottom:22px">Es gratis y toma menos de un minuto.</p><div class="stack">' +
      '<div class="grid2"><div class="field"><label for="r-n">Nombre</label><input id="r-n" name="nombre" class="input" placeholder="Tu nombre" autocomplete="given-name"><div class="err" data-err="nombre"></div></div><div class="field"><label for="r-a">Apellido</label><input id="r-a" name="apellido" class="input" placeholder="Tu apellido" autocomplete="family-name"><div class="err" data-err="apellido"></div></div></div>' +
      '<div class="field"><label for="l-e">Correo electrónico</label><input id="l-e" name="email" type="email" class="input" autocomplete="email"><div class="err" data-err="email"></div></div>' +
      '<div class="grid2"><div class="field"><label for="r-p">Contraseña</label><input id="r-p" name="pass" type="password" class="input" placeholder="Mínimo 8 caracteres" autocomplete="new-password"><div class="err" data-err="pass"></div></div><div class="field"><label for="r-c">Confirmar contraseña</label><input id="r-c" name="pass2" type="password" class="input" autocomplete="new-password"><div class="err" data-err="pass2"></div></div></div>' +
      '<label class="check"><input type="checkbox" data-act="showpass"> Mostrar contraseña</label>' +
      '<div><label class="check"><input type="checkbox" name="terms"> Acepto los términos y condiciones y la política de privacidad</label><div class="err" data-err="terms"></div></div>' +
      '<button class="btn btn-go btn-block" type="submit" id="regbtn" disabled>Crear cuenta</button><p class="center">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p></div></form>'
    : '<form data-form="login" data-next="' +
  esc(nx) +
  '" novalidate><h1>Inicia sesión</h1><p class="sub" style="margin-bottom:22px">' +
  "Ingresa tu correo y contraseña para gestionar tus reservas." +
  '</p><div class="stack">' +
  '<div class="field"><label for="l-e">Correo electrónico</label><input id="l-e" name="email" type="email" class="input" placeholder="tucorreo@ejemplo.com" autocomplete="email"><div class="err" data-err="email"></div></div>' +
  '<div class="field"><label for="l-p">Contraseña</label><input id="l-p" name="pass" type="password" class="input" autocomplete="current-password"><div class="err" data-err="pass"></div></div>' +
  '<label class="check"><input type="checkbox" data-act="showpass"> Mostrar contraseña</label>' +
  '<div class="auth-row"><label class="check"><input type="checkbox" name="remember" checked> Recordarme</label><a href="#/recuperar">¿Olvidaste tu contraseña?</a></div>' +
  '<div class="ferr" data-err="form" role="alert"></div><button class="btn btn-go btn-block" type="submit">Iniciar sesión</button><p class="center">¿No tienes cuenta? <a href="#/registro">Regístrate</a></p></div></form>';
     
  return {
    title: (reg ? "Crea tu cuenta" : "Inicia sesión") + " · Airsoft",
    html: '<section class="auth">' + left + '<div class="aform">' + form + "</div></section>",
    after: reg ? updateRegBtn : null,
  };
}
// HU-02: "Crear cuenta" se habilita solo cuando el correo tiene un formato válido
function updateRegBtn() {
  const f = $('form[data-form="register"]');
  if (!f) return;
  $("#regbtn").disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((f.elements.email.value || "").trim());
}
// HU-03: flujo de recuperación de cuenta
function vRecover() {
  if (me()) return { redirect: "#/" };
  return {
    title: "Recupera tu contraseña · Airsoft",
    html:
      '<section class="auth"><div class="sky"><div style="position:relative;z-index:1"><div class="kicker">RECUPERA TU CUENTA</div><h1>Te ayudamos a volver a entrar</h1></div></div>' +
      '<div class="aform"><div id="recover-box"><form data-form="recover" novalidate><h1>¿Olvidaste tu contraseña?</h1><p class="sub" style="margin-bottom:22px">Escribe el correo de tu cuenta y te enviamos un enlace para crear una nueva.</p><div class="stack">' +
      '<div class="field"><label for="rc-e">Correo electrónico</label><input id="rc-e" name="email" type="email" class="input" placeholder="tucorreo@ejemplo.com" autocomplete="email"><div class="err" data-err="email"></div></div>' +
      '<button class="btn btn-go btn-block" type="submit">Enviar enlace</button><p class="center"><a href="#/login">Volver a iniciar sesión</a></p></div></form></div></div></section>',
  };
}

/* pay */
function methodFields() {
  const m = S.pay;
  const c = calc(S.draft, isInt(P[S.draft.pkg].dest) ? S.draft.tasa : undefined);
  const card =
    '<div class="field"><label for="p-cn">Número de tarjeta</label><input id="p-cn" name="card" class="input" inputmode="numeric" autocomplete="off" placeholder="•••• •••• •••• ••••" maxlength="19" data-fmt="card"><div class="err" data-err="card"></div></div>' +
    '<div class="grid2"><div class="field"><label for="p-ex">Vencimiento</label><input id="p-ex" name="exp" class="input" inputmode="numeric" placeholder="MM / AA" maxlength="5" data-fmt="exp"><div class="err" data-err="exp"></div></div><div class="field"><label for="p-cv">CVV</label><input id="p-cv" name="cvv" class="input" inputmode="numeric" placeholder="•••" maxlength="4"><div class="err" data-err="cvv"></div></div></div>';
  if (m === "tarjeta") return card;
  if (m === "cuotas")
    return (
      card +
      '<div class="field"><label for="p-q">Número de cuotas</label><select id="p-q" name="cuotas" class="input">' +
      [3, 6, 12]
        .map(
          (n) =>
            '<option value="' +
            n +
            '">' +
            n +
            " cuotas de " +
            (c.sinTasa ? "valor no disponible" : money(c.total / n)) +
            " sin intereses</option>",
        )
        .join("") +
      "</select></div>"
    );
  if (m === "pse")
    return (
      '<div class="grid2"><div class="field"><label for="p-b">Banco</label><select id="p-b" name="bank" class="input"><option value="">Elige tu banco</option>' +
      BANKS.map((b) => "<option>" + b + "</option>").join("") +
      '</select><div class="err" data-err="bank"></div></div><div class="field"><label for="p-tp">Tipo de persona</label><select id="p-tp" name="ptype" class="input"><option>Natural</option><option>Jurídica</option></select></div></div><p class="note">Al confirmar te llevamos a PSE para aprobar el pago desde tu banco.</p>'
    );
  return '<div class="field"><label for="p-w">Billetera</label><select id="p-w" name="wallet" class="input"><option>Nequi</option><option>Daviplata</option></select></div><div class="field"><label for="p-cel">Celular</label><input id="p-cel" name="cel" class="input" inputmode="numeric" placeholder="300 000 0000" maxlength="12"><div class="err" data-err="cel"></div></div><p class="note">Te llega una notificación al celular para aprobar el pago.</p>';
}
function vPay() {
  if (!S.draft || !P[S.draft.pkg])
    return {
      redirect: "#/resultados",
      msg: "Primero elige un paquete para continuar con el pago.",
    };
  const u = me();
  if (!u) return { redirect: "#/login?next=" + encodeURIComponent("#/pago") };
  const dr = S.draft,
    p = P[dr.pkg],
    d = D[p.dest],
    intl = d.amb === "int",
    tNow = intl ? trmDelDia() : null;
  if (intl && tNow && !dr.tasa) {
    dr.tasa = tNow.valor;
    saveDraft();
  }
  // HU-16: si la tasa cambió entre ver el paquete y pagar, se avisa antes de confirmar
  const cambio = intl && tNow && dr.tasa !== tNow.valor;
  // HU-19: sin tasa disponible no se puede confirmar una reserva internacional
  const sinTasa = intl && !tNow;
  S.payBlock = cambio || sinTasa;
  const c = sinTasa ? calc(dr) : calc(dr, intl ? dr.tasa : undefined),
    cNew = cambio ? calc(dr, tNow.valor) : null,
    mt = [
      ["tarjeta", "💳 Tarjeta de crédito"],
      ["pse", "🏦 PSE"],
      ["linea", "📱 Pago en línea"],
      ["cuotas", "🧾 Pago en cuotas"],
    ];
  return {
    title: "Pago · Airsoft",
    after: () => {
      checkStep1();
      updatePayBtn();
    },
    html:
      '<div class="container"><div class="steps"><div class="step cur" id="st1"><i>1</i>Datos del viajero</div><hr><div class="step" id="st2"><i>2</i>Pago</div><hr><div class="step"><i>3</i>Confirmación</div></div>' +
      '<form class="payl" data-form="pay" novalidate><div>' +
      (cambio
        ? '<div class="alerta"><b>El dólar cambió mientras revisabas tu paquete</b><p>La tasa del día pasó de ' +
          tasaTxt(dr.tasa) +
          " a " +
          tasaTxt(tNow.valor) +
          ". Tu nuevo total en pesos es <b>" +
          money(cNew.total) +
          "</b> (antes " +
          money(c.total) +
          ').</p><div class="alerta-btns"><button type="button" class="btn btn-go" data-act="acepta-tasa">Continuar con el nuevo precio</button><a class="btn btn-ghost" href="#/paquete/' +
          p.id +
          '">Volver al paquete</a></div></div>'
        : "") +
      (sinTasa
        ? '<div class="alerta off"><b>Conversión no disponible en este momento</b><p>No pudimos consultar la tasa del día. Por ahora no mostramos el valor en pesos ni se puede confirmar la reserva. Intenta de nuevo en unos minutos.</p></div>'
        : "") +
      '<h2>Datos del viajero principal</h2><div class="stack">' +
      '<div class="grid2"><div class="field"><label for="v-n">Nombre</label><input id="v-n" name="nombre" class="input" data-pax value="' +
      esc(u.nombre) +
      '"><div class="err" data-err="nombre"></div></div><div class="field"><label for="v-a">Apellido</label><input id="v-a" name="apellido" class="input" data-pax value="' +
      esc(u.apellido) +
      '"><div class="err" data-err="apellido"></div></div></div>' +
      '<div class="grid2"><div class="field"><label for="v-d">Documento de identidad</label><input id="v-d" name="doc" class="input" data-pax placeholder="Cédula o pasaporte"><div class="err" data-err="doc"></div></div><div class="field"><label for="v-e">Correo electrónico</label><input id="v-e" name="email" type="email" class="input" data-pax value="' +
      esc(u.email) +
      '"><div class="err" data-err="email"></div></div></div></div>' +
      '<h2 style="margin-top:34px">Método de pago</h2><div class="methods" role="radiogroup" aria-label="Método de pago">' +
      mt
        .map(
          ([k, l]) =>
            '<button type="button" role="radio" aria-checked="' +
            (S.pay === k) +
            '" class="method' +
            (S.pay === k ? " on" : "") +
            '" data-act="method" data-m="' +
            k +
            '">' +
            l +
            "</button>",
        )
        .join("") +
      '</div><div class="stack" id="mfields" style="margin-top:18px">' +
      methodFields() +
      "</div></div>" +
      '<aside class="sum"><h2>Resumen de tu compra</h2><div class="sumpkg"><div class="sq" style="background:' +
      d.grad +
      '"></div><div><b>' +
      esc(pkgTitle(p)) +
      "</b><small>" +
      fRange(dr.start, addDays(dr.start, p.nights)) +
      " · " +
      plural(dr.travelers, "adulto", "adultos") +
      (dr.hotel ? " · " + esc(H[dr.hotel].name) : "") +
      "</small></div></div>" +
      (intl
        ? '<div class="line"><span>Paquete (x' +
          dr.travelers +
          ") en dólares</span><span>" +
          usd(c.subFx) +
          "</span></div>" +
          (sinTasa
            ? '<div class="line"><span>Tasa del día</span><span>No disponible</span></div>'
            : '<div class="line"><span>Tasa del día usada</span><span>' +
              tasaTxt(c.rate) +
              '</span></div><div class="line"><span>Equivalente en pesos</span><span>' +
              money(c.sub) +
              "</span></div>")
        : '<div class="line"><span>Paquete (x' + dr.travelers + ")</span><span>" + money(c.sub) + "</span></div>") +
      (sinTasa
        ? ""
        : '<div class="line"><span>Impuestos y tasas</span><span>' +
          money(c.tax) +
          "</span></div>" +
          (c.disc
            ? '<div class="line"><span>Descuento Airsoft</span><span class="minus">-' + money(c.disc) + "</span></div>"
            : "")) +
      '<div class="perf"></div><div class="total"><span>Total a pagar</span><span>' +
      (sinTasa ? "No disponible" : money(c.total)) +
      "</span></div>" +
      (intl && !sinTasa
        ? '<p class="tasa-box" style="margin-bottom:14px">Al confirmar, este valor en pesos queda fijo y no cambia aunque el dólar suba o baje después.</p>'
        : "") +
      '<button class="btn btn-go btn-block" type="submit" id="paybtn" disabled>Confirmar y pagar</button><p class="note" style="margin-top:12px">🔒 Pago 100% seguro y encriptado</p><p class="demo-note">Versión de demostración: no se hace ningún cobro real.</p>' +
      (intl ? demoTasa(["tasa-nueva", "sin-tasa"]) : "") +
      '<a class="btn btn-text" href="#/paquete/' +
      p.id +
      '" style="margin-top:6px;padding-left:0">Volver al paquete</a></aside></form></div>',
  };
}
function paxErrors(f) {
  const v = (n) => (f.elements[n].value || "").trim();
  const e = {};
  if (!v("nombre")) e.nombre = "Escribe tu nombre.";
  if (!v("apellido")) e.apellido = "Escribe tu apellido.";
  if (!v("doc")) e.doc = "Escribe tu número de documento.";
  else if (!/^[A-Za-z0-9]{5,12}$/.test(v("doc")))
    e.doc = "Revisa el documento: solo números y letras, entre 5 y 12 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email")))
    e.email = "correo invalido";
  return e;
}
// HU-07: "Confirmar y pagar" se habilita cuando los datos del método de pago son válidos
function payMethodErrors(f) {
  const v = (n) => (f.elements[n] ? (f.elements[n].value || "").replace(/\s/g, "") : "");
  const e = {};
  if (S.pay === "tarjeta" || S.pay === "cuotas") {
    if (!/^\d{16}$/.test(v("card"))) e.card = "El número de tarjeta debe tener 16 dígitos.";
    const m = v("exp").match(/^(\d{2})\/(\d{2})$/);
    if (!m || +m[1] < 1 || +m[1] > 12) e.exp = "Usa el formato MM/AA.";
    else {
      const now = new Date();
      const y = 2000 + +m[2];
      if (y < now.getFullYear() || (y === now.getFullYear() && +m[1] < now.getMonth() + 1))
        e.exp = "Esta tarjeta ya venció.";
    }
    if (!/^\d{3,4}$/.test(v("cvv"))) e.cvv = "El CVV son los 3 o 4 números al respaldo.";
  } else if (S.pay === "pse") {
    if (!v("bank")) e.bank = "Elige tu banco.";
  } else if (!/^3\d{9}$/.test(v("cel"))) e.cel = "Escribe un celular de 10 dígitos que empiece por 3.";
  return e;
}
function updatePayBtn() {
  const f = $('form[data-form="pay"]');
  const b = $("#paybtn");
  if (!f || !b || b.textContent !== "Confirmar y pagar") return;
  b.disabled = !!S.payBlock || Object.keys(payMethodErrors(f)).length > 0;
}
function checkStep1() {
  const f = $('form[data-form="pay"]');
  if (!f) return;
  const ok = !Object.keys(paxErrors(f)).length;
  $("#st1").className = "step " + (ok ? "done" : "cur");
  $("#st1 i").textContent = ok ? "✓" : "1";
  $("#st2").className = "step" + (ok ? " cur" : "");
}

/* confirmation + bookings */
function bookingRow(b) {
  const d = D[b.dest];
  const s = status(b);
  const cls = s === "Confirmada" ? "ok" : s === "Cancelada" ? "x" : "done";
  return (
    '<article class="bk"><div class="thumb" style="background:' +
    d.grad +
    '">' +
    esc(d.name) +
    "</div><div><h3>Viaje a " +
    esc(d.name) +
    "</h3><p>" +
    fRange(b.start, b.end, true) +
    " · " +
    b.code +
    '</p></div><span class="badge ' +
    cls +
    '">' +
    s +
    '</span><a class="btn btn-ghost" href="#/confirmacion/' +
    b.code +
    '">Ver detalle</a></article>'
  );
}
function myList() {
  const u = me();
  return bookings()
    .filter((b) => b.user === u.email)
    .sort((a, b) => b.start.localeCompare(a.start));
}
function vConfirm(code, q) {
  const u = me();
  if (!u) return { redirect: "#/login?next=" + encodeURIComponent("#/confirmacion/" + code) };
  const b = bookings().find((x) => x.code === code && x.user === u.email);
  if (!b)
    return {
      title: "Reserva no encontrada · Airsoft",
      html: '<div class="conf"><h1>No encontramos esa reserva</h1><p class="lead">Revisa el código o entra a tus reservas para verlas todas.</p><div class="tkactions"><a class="btn btn-go" href="#/mis-reservas">Ver mis reservas</a></div></div>',
    };
  const fresh = q.get("nuevo") === "1";
  const d = D[b.dest];
  const s = status(b);
  const h = b.hotel ? H[b.hotel] : null;
  return {
    title: (fresh ? "Reserva confirmada" : "Reserva " + b.code) + " · Airsoft",
    html:
      '<div class="conf">' +
      (fresh
        ? '<div class="okmark"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h1>¡Tu viaje está confirmado!</h1><p class="lead">Enviamos los detalles y tu comprobante a ' +
          esc(b.pax.notify || b.pax.email) +
          ".</p>"
        : '<h1>Detalle de tu reserva</h1><p class="lead">Estado: <span class="badge ' +
          (s === "Confirmada" ? "ok" : s === "Cancelada" ? "x" : "done") +
          '">' +
          s +
          "</span></p>") +
      '<div class="tk"><div class="main"><div class="route"><div><b>' +
      b.origin +
      "</b><small>" +
      ORIG[b.origin] +
      '</small></div><svg width="26" height="26" viewBox="0 0 24 24" fill="#1FB081" aria-hidden="true"><path d="M21 3L3 10.5l7 2.5 2.5 7z"/></svg><div><b>' +
      d.code +
      "</b><small>" +
      esc(d.name) +
      "</small></div></div>" +
      '<div class="tkgrid"><div><span>Pasajero</span><b>' +
      esc(b.pax.nombre + " " + b.pax.apellido) +
      "</b></div><div><span>Fechas</span><b>" +
      fRange(b.start, b.end, true) +
      "</b></div><div><span>Viajeros</span><b>" +
      plural(b.travelers, "adulto", "adultos") +
      "</b></div><div><span>Plan</span><b>" +
      PLAN[b.plan] +
      "</b></div><div><span>Hotel</span><b>" +
      (h
        ? esc(h.name.replace(/^(Hotel|Hostal|Posada|Resort) /, "")) + " " + h.stars + "★"
        : "Sin hotel") +
      "</b></div><div><span>Total pagado</span><b>" +
      money(b.total) +
      (b.intl ? '<small class="fija">' + usd(b.subFx) + " con tasa fija de " + tasaTxt(b.rate) + "</small>" : "") +
      "</b></div></div></div>" +
      '<div class="stub"><div class="qr">' +
      qr(b.code) +
      '</div><div class="code">' +
      b.code +
      "</div><small>Código de reserva</small></div></div>" +
      "</div>",
  };
}
function vMine() {
  const u = me();
  if (!u) return { redirect: "#/login?next=" + encodeURIComponent("#/mis-reservas") };
  const l = myList();
  return {
    title: "Mis reservas · Airsoft",
    html:
      '<div class="conf" style="max-width:820px"><h1 style="text-align:left">Mis reservas</h1><p class="sub" style="margin:6px 0 24px">' +
      (l.length ? "Aquí están tus viajes con Airsoft." : "") +
      "</p>" +
      (l.length
        ? l.map(bookingRow).join("")
        : '<div class="empty">Todavía no tienes reservas<br><a class="btn btn-go" href="#/" style="margin-top:14px">Buscar viajes</a></div>') +
      "</div>",
  };
}

/* ---------- HU-18 · Agencias por país y fechas ---------- */
let AGQ = null;
function vAgencias() {
  if (!AGQ) AGQ = { pais: "Panamá", in: S.search.start, out: S.search.end };
  const paises = ["Colombia"].concat(paisesInt());
  const intl = AGQ.pais !== "Colombia";
  const lista = AGENCIAS.filter((a) => a.paises.includes(AGQ.pais));
  const noches = daysBetween(AGQ.in, AGQ.out);
  const ofertas = (a) => PKGS.filter((p) => p.ag === a.id && D[p.dest].country === AGQ.pais);
  return {
    title: "Agencias por país · Airsoft",
    html:
      '<div class="bar"><div class="container"><form class="search ag" data-form="agencias" novalidate>' +
      '<div class="field"><label for="ag-p">País</label><select id="ag-p" name="pais" class="input">' +
      paises.map((c) => "<option" + (c === AGQ.pais ? " selected" : "") + ">" + esc(c) + "</option>").join("") +
      "</select></div>" +
      '<div class="field"><label for="ag-i">Entrada</label><input id="ag-i" type="date" name="in" class="input" min="' +
      today() +
      '" value="' +
      AGQ.in +
      '"></div><div class="field"><label for="ag-o">Salida</label><input id="ag-o" type="date" name="out" class="input" min="' +
      today() +
      '" value="' +
      AGQ.out +
      '"></div><button class="btn btn-go" type="submit">Buscar</button><div class="ferr" data-err="form" role="alert"></div></form></div></div>' +
      '<section class="section" style="padding-top:36px"><div class="container narrow"><h1 class="h2">Agencias que viajan a ' +
      esc(AGQ.pais) +
      '</h1><p class="sub" style="margin:6px 0 22px">' +
      fRange(AGQ.in, AGQ.out, true) +
      " · <b>" +
      plural(noches, "noche", "noches") +
      "</b> (contadas con las fechas locales de " +
      esc(AGQ.pais) +
      ")</p>" +
      (lista.length
        ? lista
            .map((a) => {
              const o = ofertas(a);
              const min = o.length ? o.reduce((x, y) => (y.price < x.price ? y : x)) : null;
              return (
                '<article class="row agr"><div><h3>' +
                esc(a.nombre) +
                '</h3><p class="m">' +
                plural(o.length, "oferta disponible", "ofertas disponibles") +
                ' en tus fechas</p><div class="tags"><span class="m">Viaja a:</span>' +
                a.paises.map((c) => '<span class="tag soft">' + esc(c) + "</span>").join("") +
                '</div></div><div class="price">' +
                (min ? "<small>Desde</small>" + precioHTML(min.price, min.dest) : "") +
                '<button class="btn btn-ghost" data-act="ag-ofertas" data-ag="' +
                a.id +
                '">Ver ofertas</button></div></article>'
              );
            })
            .join("")
        : '<div class="empty">Ninguna agencia declara viajar a ' + esc(AGQ.pais) + " por ahora.</div>") +
      (intl
        ? '<div class="tasa-box" style="margin-top:16px">Solo se muestran las agencias que declaran viajar a ' +
          esc(AGQ.pais) +
          ". Las agencias que operan únicamente en Colombia no aparecen en esta búsqueda.</div>"
        : "") +
      "</div></section>",
  };
}

/* simple pages */
function vNosotros() {
  return {
    title: "Nosotros · Airsoft",
    html:
      '<section class="sky"><div class="container page-sky"><h1>Nosotros</h1><p>Airsoft organiza y vende experiencias de viaje a destinos nacionales e internacionales, con paquetes que combinan tiquetes aéreos y alojamiento para que cada persona planee su viaje a su manera.</p></div></section>' +
      '<section class="section"><div class="container"><div class="two"><div><h2>Misión</h2><p>Hacer que planear un viaje sea tan sencillo y placentero como vivirlo, con alternativas claras y flexibles para que cada persona arme la experiencia que realmente quiere.</p></div><div><h2>Visión</h2><p>Ser la agencia de referencia para cualquier persona que quiera explorar el mundo, reconocida por acompañar a sus viajeros de forma cercana y ágil, del primer clic al regreso a casa.</p></div></div>' +
      '<h2 class="h2" style="margin-top:48px;font-size:1.4rem">Lo que nos mueve</h2><div class="vals"><div><b>Cercanía</b><p>Hablamos como personas, no como un mostrador de aeropuerto.</p></div><div><b>Simplicidad</b><p>Quitamos pasos y fricción de todo el proceso de reservar.</p></div><div><b>Confianza</b><p>Somos claros con precios, tiempos y condiciones, sin letra pequeña.</p></div><div><b>Curiosidad</b><p>Celebramos explorar y vivir cosas nuevas, sin importar el destino.</p></div></div></div></section>',
  };
}
function vContacto() {
  const u = me();
  return {
    title: "Contacto · Airsoft",
    html:
      '<section class="sky"><div class="container page-sky"><h1>Hablemos de tu viaje</h1><p>Escríbenos y un asesor te responde en menos de 24 horas.</p></div></section>' +
      '<section class="section"><div class="container two"><form data-form="contact" class="stack" novalidate><div class="field"><label for="c-n">Nombre</label><input id="c-n" name="nombre" class="input" value="' +
      esc(u ? u.nombre + " " + u.apellido : "") +
      '"><div class="err" data-err="nombre"></div></div><div class="field"><label for="c-e">Correo electrónico</label><input id="c-e" name="email" type="email" class="input" value="' +
      esc(u ? u.email : "") +
      '"><div class="err" data-err="email"></div></div><div class="field"><label for="c-m">Mensaje</label><textarea id="c-m" name="msg" class="input" placeholder="Cuéntanos a dónde quieres ir o en qué te ayudamos"></textarea><div class="err" data-err="msg"></div></div><button class="btn btn-go" type="submit">Enviar mensaje</button></form>' +
      '<div><h2>Otros canales</h2><p style="margin-top:10px">Correo: hola@airsoft.co</p><p>Horario: lunes a sábado, de 7:00 a. m. a 8:00 p. m.</p><p>Oficinas en Bogotá, Medellín y Cartagena.</p><h2 style="margin-top:28px">¿Ya tienes una reserva?</h2><p style="margin-top:10px">Entra a <a href="#/mis-reservas">Mis reservas</a> para ver el estado y el detalle de cada viaje.</p></div></div></section>',
  };
}
function vNotFound() {
  return {
    title: "Página no encontrada · Airsoft",
    html: '<div class="conf"><h1>Esta página no existe</h1><p class="lead">Puede que el enlace esté mal escrito. Vuelve al inicio y busca tu próximo destino.</p><div class="tkactions"><a class="btn btn-go" href="#/">Ir al inicio</a></div></div>',
  };
}
