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
    money(m.price) +
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
      '<section class="section"><div class="container"><div class="sec-head"><div><h2>Destinos populares</h2><p class="sub">Los planes que más está reservando la comunidad Airsoft</p></div><a class="btn btn-ghost" href="#/destinos">Ver todos los destinos</a></div><div class="dest-grid">' +
      DEST.filter((d) => d.pop)
        .map(destCard)
        .join("") +
      "</div></div></section>" +
      '<section class="section" style="padding-top:0"><div class="container"><h2 class="h2" style="margin-bottom:26px">¿Por qué viajar con Airsoft?</h2><div class="why">' +
      "<div><h3>Precios claros por persona</h3></div>" +
      "<div><h3>Soporte antes y durante el viaje</h3></div>" +
      "<div><h3>Paquetes flexibles</h3></div></div></div></section>" +
      '<section style="padding-bottom:64px"><div class="container"><div class="band"><h2>Explora sin límites. Tu próxima historia empieza aquí.</h2>' +
      (u
        ? '<a class="btn btn-white" href="#/mis-reservas">Ver mis reservas</a>'
        : '<a class="btn btn-white" href="#/registro">Crear cuenta gratis</a>') +
      "</div></div></section>",
  };
}

function vDestinos(q) {
  const reg = q.get("region");
  const list = DEST.filter((d) => !reg || d.region === reg);
  const regs = ["Colombia", "Caribe", "Suramérica", "Europa"];
  return {
    title: "Destinos · Airsoft",
    html:
      '<section class="sky"><div class="container page-sky"><h1>' +
      (reg ? "Destinos en " + esc(reg) : "Todos los destinos") +
      "</h1><p>Elige un destino y te mostramos los paquetes disponibles para tus fechas.</p></div></section>" +
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
  return PKGS.filter((p) => !S.search.dest || p.dest === S.search.dest);
}
function vResults(q) {
  if (q.has("destino")) {
    S.search.dest = D[q.get("destino")] ? q.get("destino") : "";
    saveSearch();
    F = resetF();
    history.replaceState(null, "", "#/resultados");
  }
  if (!F) F = resetF();
  const base = resultBase();
  const lo = Math.floor(Math.min(...base.map((p) => p.price)) / 100000) * 100000;
  const hi = Math.ceil(Math.max(...base.map((p) => p.price)) / 100000) * 100000;
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
  const step = 100000;
  return {
    title: "Paquetes · Airsoft",
    after: () => {
      syncRange("#prange", lo, hi);
      openFilters();
    },
    html:
      '<div class="bar"><div class="container">' +
      searchForm() +
      "</div></div>" +
      '<div class="container layout"><details class="filters" open><summary>Filtrar resultados</summary><h3>Filtrar resultados</h3>' +
      '<div class="fgroup"><h4>Rango de precio</h4><div class="range" id="prange"><div class="track"></div><div class="fill"></div><input type="range" aria-label="Precio mínimo" min="' +
      lo +
      '" max="' +
      hi +
      '" step="' +
      step +
      '" value="' +
      F.min +
      '" data-range="min"><input type="range" aria-label="Precio máximo" min="' +
      lo +
      '" max="' +
      hi +
      '" step="' +
      step +
      '" value="' +
      F.max +
      '" data-range="max"></div><div class="rl"><span id="rmin">' +
      money(F.min) +
      '</span><span id="rmax">' +
      money(F.max) +
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
      '</details><section aria-live="polite"><div class="lhead"><span class="count" id="rcount"></span><label class="sr" for="rsort">Ordenar</label><select id="rsort" class="sort" data-act="rsort"><option value="rec">Ordenar: Recomendados</option><option value="asc">Ordenar: Menor precio</option><option value="desc">Ordenar: Mayor precio</option><option value="dur">Ordenar: Más noches</option></select></div><div id="rlist"></div></section></div>',
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
    plural(l.length, "paquete encontrado", "paquetes encontrados") + (d ? " a " + d.name : "");
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
            "</div><div><h3>" +
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
            '<div class="price"><b>' +
            money(p.price) +
            '</b><small>por persona</small><button class="btn btn-go" data-act="open-pkg" data-id="' +
            p.id +
            '">Ver paquete</button></div></article>'
          );
        })
        .join("")
    : '<div class="empty">Ningún paquete coincide con estos filtros. Quita alguno para ver más opciones.<br><button class="btn btn-ghost" data-act="fclear">Limpiar filtros</button></div>';
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
      hotel: p.hotel,
    };
    saveDraft();
  }
}
function includes(p, h, o) {
  const d = D[p.dest];
  const L = [];
  L.push(" Vuelo ida y vuelta " + ORIG[o] + " – " + d.name);
  if (h)
    L.push(
      " " +
        plural(p.nights, "noche", "noches") +
        " en hotel " +
        h.stars +
        "★" +
        (h.amen.includes(A_MAR) ? " frente al mar" : ""),
    );
  if (p.plan === "todo") {
    L.push(
      "Plan todo incluido (desayuno, almuerzo, cena)",
      "Traslados aeropuerto – hotel – aeropuerto",
      "Equipaje de bodega y de mano",
      "Asistencia médica en viaje",
    );
  } else if (p.plan === "vh") {
    if (h.amen.includes(A_DES)) L.push("Desayuno incluido");
    L.push(" Equipaje de mano máximo 10 kg", "Asistencia médica en viaje");
  } else
    L.push(
      "Equipaje de mano máximo 10 kg",
      "Silla estándar asignada",
      "Un cambio de fecha con costo",
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
function vDetail(id) {
  const p = P[id];
  if (!p) return vNotFound();
  ensureDraft(id);
  const dr = S.draft;
  const h = dr.hotel ? H[dr.hotel] : null;
  const d = D[p.dest];
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
      '</div><aside class="book"><div class="big">' +
      money(c.pp) +
      " <small>/ por persona</small></div>" +
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
      (h
        ? '<div class="field"><label for="b-r">Habitación</label><select id="b-r" class="input" data-draft="room">' +
          Object.entries(ROOMS)
            .map(
              ([k, [n, x]]) =>
                '<option value="' +
                k +
                '"' +
                (k === dr.room ? " selected" : "") +
                ">" +
                n +
                (x ? " (+" + money(x) + " por noche)" : "") +
                "</option>",
            )
            .join("") +
          "</select></div>"
        : "") +
      '</div><div style="margin:16px 0 14px"><div class="line"><span>Total ' +
      plural(dr.travelers, "viajero", "viajeros") +
      "</span><b>" +
      money(c.sub) +
      '</b></div><div class="line"><span>Impuestos y tasas</span><span>' +
      money(c.tax) +
      "</span></div></div>" +
      '<button class="btn btn-go btn-block" data-act="reserve">Reservar ahora</button><div class="err" id="b-err"></div>' +
      '<p class="note" style="margin-top:14px"> Cancelación gratuita hasta 48 h antes</p><p class="note" style="margin-top:6px">💳 Paga en cuotas sin intereses</p></aside></div>',
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
  const lo = Math.floor(Math.min(...base.map((h) => h.nightly)) / 50000) * 50000,
    hi = Math.ceil(Math.max(...base.map((h) => h.nightly)) / 50000) * 50000;
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
      '<div class="bar"><div class="container"><form class="search h" data-form="hsearch" novalidate>' +
      '<div class="field"><label for="h-d">Destino</label><select id="h-d" name="dest" class="input">' +
      DEST.map(
        (d) =>
          '<option value="' +
          d.id +
          '"' +
          (d.id === dest ? " selected" : "") +
          ">" +
          esc(d.name + ", " + d.country) +
          "</option>",
      ).join("") +
      "</select></div>" +
      '<div class="field"><label for="h-i">Check-in / Check-out</label><div class="dates"><input id="h-i" type="date" name="in" class="input" aria-label="Check-in" min="' +
      today() +
      '" value="' +
      hs.in +
      '"><input type="date" name="out" class="input" aria-label="Check-out" min="' +
      today() +
      '" value="' +
      hs.out +
      '"></div></div>' +
      '<div class="field"><label for="h-g">Huéspedes</label><select id="h-g" name="guests" class="input">' +
      [1, 2, 3, 4, 5, 6]
        .map(
          (n) =>
            '<option value="' +
            n +
            '"' +
            (n === hs.guests ? " selected" : "") +
            ">" +
            plural(n, "adulto", "adultos") +
            ", " +
            (n > 2 ? Math.ceil(n / 2) + " habitaciones" : "1 habitación") +
            "</option>",
        )
        .join("") +
      "</select></div>" +
      '<button class="btn btn-go" type="submit">Buscar hoteles</button><div class="ferr" data-err="form" role="alert"></div></form></div></div>' +
      '<div class="container layout"><details class="filters" open><summary>Filtrar hoteles</summary><h3>Filtrar hoteles</h3>' +
      '<div class="fgroup"><h4>Precio por noche</h4><div class="range" id="hrange"><div class="track"></div><div class="fill"></div><input type="range" aria-label="Precio mínimo por noche" min="' +
      lo +
      '" max="' +
      hi +
      '" step="10000" value="' +
      HF.min +
      '" data-hrange="min"><input type="range" aria-label="Precio máximo por noche" min="' +
      lo +
      '" max="' +
      hi +
      '" step="10000" value="' +
      HF.max +
      '" data-hrange="max"></div><div class="rl"><span id="hmin">' +
      money(HF.min) +
      '</span><span id="hmax">' +
      money(HF.max) +
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
            '<div class="price"><b>' +
            money(h.nightly) +
            "</b><small>por noche · " +
            money(h.nightly * n * rooms) +
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
    : '<div class="empty">Ningún hotel cumple todos estos filtros. Quita alguno para ver más opciones.<br><button class="btn btn-ghost" data-act="hclear">Limpiar filtros</button></div>';
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
    (reg ? "ÚNETE A AIRSOFT" : "BIENVENIDA DE VUELTA") +
    "</div><h1>" +
    (reg ? "Crea tu cuenta y guarda tus viajes favoritos" : "Tus reservas te están esperando") +
    '</h1></div><div class="quote">"Reserva tu viaje soñado, sin llamadas ni filas."</div></div>';
  const form = reg
    ? '<form data-form="register" data-next="' +
      esc(nx) +
      '" novalidate><h1>Crea tu cuenta</h1><p class="sub" style="margin-bottom:22px">Es gratis y toma menos de un minuto.</p><div class="stack">' +
      '<div class="grid2"><div class="field"><label for="r-n">Nombre</label><input id="r-n" name="nombre" class="input" placeholder="Tu nombre" autocomplete="given-name"><div class="err" data-err="nombre"></div></div><div class="field"><label for="r-a">Apellido</label><input id="r-a" name="apellido" class="input" placeholder="Tu apellido" autocomplete="family-name"><div class="err" data-err="apellido"></div></div></div>' +
      '<div class="field"><label for="r-e">Correo electrónico</label><input id="r-e" name="email" type="email" class="input" placeholder="tucorreo@ejemplo.com" autocomplete="email"><div class="err" data-err="email"></div></div>' +
      '<div class="grid2"><div class="field"><label for="r-p">Contraseña</label><input id="r-p" name="pass" type="password" class="input" placeholder="Mínimo 8 caracteres" autocomplete="new-password"><div class="err" data-err="pass"></div></div><div class="field"><label for="r-c">Confirmar contraseña</label><input id="r-c" name="pass2" type="password" class="input" autocomplete="new-password"><div class="err" data-err="pass2"></div></div></div>' +
      '<div><label class="check"><input type="checkbox" name="terms"> Acepto los términos y condiciones y la política de privacidad</label><div class="err" data-err="terms"></div></div>' +
      '<button class="btn btn-go btn-block" type="submit">Crear cuenta</button><p class="center">¿Ya tienes cuenta? <a href="#/login' +
      (nx ? "?next=" + encodeURIComponent(nx) : "") +
      '">Inicia sesión</a></p></div></form>'
    : '<form data-form="login" data-next="' +
      esc(nx) +
      '" novalidate><h1>Inicia sesión</h1><p class="sub" style="margin-bottom:22px">' +
      (nx === "#/pago"
        ? "Entra para terminar tu reserva. Tu selección quedó guardada."
        : "Qué bueno verte de nuevo.") +
      '</p><div class="stack">' +
      '<div class="field"><label for="l-e">Correo electrónico</label><input id="l-e" name="email" type="email" class="input" placeholder="tucorreo@ejemplo.com" autocomplete="email"><div class="err" data-err="email"></div></div>' +
      '<div class="field"><label for="l-p">Contraseña</label><input id="l-p" name="pass" type="password" class="input" autocomplete="current-password"><div class="err" data-err="pass"></div></div>' +
      '<div class="ferr" data-err="form" role="alert"></div><button class="btn btn-go btn-block" type="submit">Iniciar sesión</button><p class="center">¿No tienes cuenta? <a href="#/registro' +
      (nx ? "?next=" + encodeURIComponent(nx) : "") +
      '">Regístrate</a></p></div>';
  return {
    title: (reg ? "Crea tu cuenta" : "Inicia sesión") + " · Airsoft",
    html: '<section class="auth">' + left + '<div class="aform">' + form + "</div></section>",
  };
}

/* pay */
function methodFields() {
  const m = S.pay;
  const c = calc(S.draft);
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
            money(c.total / n) +
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
    c = calc(dr),
    mt = [
      ["tarjeta", " Tarjeta de crédito"],
      ["pse", " PSE"],
      ["linea", " Pago en línea"],
      ["cuotas", " Pago en cuotas"],
    ];
  return {
    title: "Pago · Airsoft",
    after: checkStep1,
    html:
      '<div class="container"><div class="steps"><div class="step cur" id="st1"><i>1</i>Datos del viajero</div><hr><div class="step" id="st2"><i>2</i>Pago</div><hr><div class="step"><i>3</i>Confirmación</div></div>' +
      '<form class="payl" data-form="pay" novalidate><div><h2>Datos del viajero principal</h2><div class="stack">' +
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
      '<div class="line"><span>Paquete (x' +
      dr.travelers +
      ")</span><span>" +
      money(c.sub) +
      '</span></div><div class="line"><span>Impuestos y tasas</span><span>' +
      money(c.tax) +
      "</span></div>" +
      (c.disc
        ? '<div class="line"><span>Descuento Airsoft</span><span class="minus">-' +
          money(c.disc) +
          "</span></div>"
        : "") +
      '<div class="perf"></div><div class="total"><span>Total a pagar</span><span>' +
      money(c.total) +
      '</span></div><button class="btn btn-go btn-block" type="submit" id="paybtn">Confirmar y pagar</button><p class="note" style="margin-top:12px">🔒 Pago 100% seguro y encriptado</p><p class="demo-note">Versión de demostración: no se hace ningún cobro real.</p>' +
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
    e.email = "Revisa el correo, parece que le falta algo.";
  return e;
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
  const canCancel = s === "Confirmada" && pD(b.start) - new Date() > 48 * 3600e3;
  const others = myList().filter((x) => x.code !== b.code);
  return {
    title: (fresh ? "Reserva confirmada" : "Reserva " + b.code) + " · Airsoft",
    html:
      '<div class="conf">' +
      (fresh
        ? '<div class="okmark"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h1>¡Tu viaje está confirmado!</h1><p class="lead">Enviamos los detalles y tu comprobante a ' +
          esc(b.pax.email) +
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
      "</b></div></div></div>" +
      '<div class="stub"><div class="qr">' +
      qr(b.code) +
      '</div><div class="code">' +
      b.code +
      "</div><small>Código de reserva</small></div></div>" +
      '<div class="tkactions">' +
      (canCancel
        ? '<button class="btn btn-danger" data-act="cancel" data-code="' +
          b.code +
          '">Cancelar reserva</button>'
        : "") +
      (s === "Confirmada" && !canCancel
        ? '<p class="note">Faltan menos de 48 horas para el viaje, ya no aplica la cancelación gratuita.</p>'
        : "") +
      "</div>" +
      '<div style="margin-top:40px"><h2 class="h2" style="font-size:1.4rem;margin-bottom:16px">Mis reservas</h2>' +
      [b].concat(others).map(bookingRow).join("") +
      "</div></div>",
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
      (l.length ? "Aquí están todos tus viajes con Airsoft." : "") +
      "</p>" +
      (l.length
        ? l.map(bookingRow).join("")
        : '<div class="empty">Todavía no tienes reservas. Busca tu primer destino y aquí aparecerá.<br><a class="btn btn-go" href="#/" style="margin-top:14px">Buscar viajes</a></div>') +
      "</div>",
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
      '<div><h2>Otros canales</h2><p style="margin-top:10px">Correo: hola@airsoft.co</p><p>Horario: lunes a sábado, de 7:00 a. m. a 8:00 p. m.</p><p>Oficinas en Bogotá, Medellín y Cartagena.</p><h2 style="margin-top:28px">¿Ya tienes una reserva?</h2><p style="margin-top:10px">Entra a <a href="#/mis-reservas">Mis reservas</a> para ver el detalle o cancelar sin costo hasta 48 horas antes.</p></div></div></section>',
  };
}
function vNotFound() {
  return {
    title: "Página no encontrada · Airsoft",
    html: '<div class="conf"><h1>Esta página no existe</h1><p class="lead">Puede que el enlace esté mal escrito. Vuelve al inicio y busca tu próximo destino.</p><div class="tkactions"><a class="btn btn-go" href="#/">Ir al inicio</a></div></div>',
  };
}
