/* Airsoft · Enrutador y manejo de eventos (formularios, clics, filtros) */
"use strict";

/* ---------- router ---------- */
function parse() {
  const h = location.hash.slice(1) || "/";
  const i = h.indexOf("?");
  const p = i < 0 ? h : h.slice(0, i);
  return {
    parts: p.split("/").filter(Boolean),
    q: new URLSearchParams(i < 0 ? "" : h.slice(i + 1)),
  };
}
function route(keep) {
  const { parts, q } = parse();
  // Solo para el sprint review (HU-16 y HU-19): ?simular=tasa-nueva | sin-tasa | normal
  if (q.has("simular")) {
    const sim = q.get("simular");
    store.set("simular", ["tasa-nueva", "sin-tasa"].includes(sim) ? sim : "normal");
  }
  const r = parts[0] || "";
  let v;
  switch (r) {
    case "":
      v = vHome();
      break;
    case "destinos":
      v = vDestinos(q);
      break;
    case "resultados":
      v = vResults(q);
      break;
    case "paquete":
      v = vDetail(parts[1]);
      break;
    case "hoteles":
      v = vHotels(q);
      break;
    case "registro":
      v = vAuth("registro", q);
      break;
    case "login":
      v = vAuth("login", q);
      break;
    case "recuperar":
      v = vRecover();
      break;
    case "pago":
      v = vPay();
      break;
    case "confirmacion":
      v = vConfirm(parts[1], q);
      break;
    case "mis-reservas":
      v = vMine();
      break;
    case "nosotros":
      v = vNosotros();
      break;
    case "contacto":
      v = vContacto();
      break;
    case "trabaja":
      v = parts[1] === "aplicar" ? vAplicar(parts[2]) : vCarreras();
      break;
    case "blog":
      v = parts[1] ? vArticulo(parts[1]) : vBlog();
      break;
    case "ayuda":
      v = vAyuda();
      break;
    case "terminos":
      v = vTerminos();
      break;
    case "agencias":
      v = vAgencias(q);
      break;
    default:
      v = vNotFound();
  }
  if (v.redirect) {
    if (v.msg) toast(v.msg);
    location.replace(v.redirect);
    return;
  }
  header(r);
  $("#app").innerHTML = v.html;
  document.title = v.title;
  if (r === "resultados") renderResultList();
  if (r === "hoteles") renderHotelList();
  if (v.after) v.after();
  if (!keep) window.scrollTo(0, 0);
}

/* ---------- events ---------- */
// conserva origen, fechas y viajeros al cambiar de nacional a internacional en el buscador
function keepSearchFields() {
  const f = $('form[data-form="search"]');
  if (!f) return;
  const e = f.elements;
  S.search.origin = e.origin.value;
  if (e.start.value) S.search.start = e.start.value;
  if (e.end.value) S.search.end = e.end.value;
  S.search.travelers = +e.travelers.value;
}
const handlers = {
  search(f) {
    clearErrs(f);
    const d = Object.fromEntries(new FormData(f));
    const amb = d.amb === "int" ? "int" : "nac";
    let dest = "",
      pais = "";
    if (amb === "nac" && d.dest.trim()) {
      const m = matchDest(d.dest);
      if (!m || m.amb !== "nac") {
        setErr(
          f,
          "form",
          "No tenemos paquetes nacionales a “" +
            d.dest.trim() +
            "”. Prueba con Cartagena, San Andrés, Santa Marta o Eje Cafetero, o elige Internacional.",
        );
        return;
      }
      dest = m.id;
    }
    if (amb === "int") {
      dest = d.city || "";
      pais = dest ? D[dest].country : d.pais || "";
    }
    if (!d.start || !d.end) {
      setErr(f, "form", "Elige la fecha de ida y la de regreso.");
      return;
    }
    if (d.start < today()) {
      setErr(f, "form", "La fecha de ida ya pasó. Elige una desde hoy en adelante.");
      return;
    }
    if (d.end <= d.start) {
      setErr(f, "form", "La fecha de regreso tiene que ser después de la de ida.");
      return;
    }
    S.search = { origin: d.origin, amb, pais, dest, ag: "", start: d.start, end: d.end, travelers: +d.travelers };
    saveSearch();
    F = resetF();
    S.draft = null;
    saveDraft();
    go("#/resultados");
  },
  agencias(f) {
    clearErrs(f);
    const d = Object.fromEntries(new FormData(f));
    if (!d.in || !d.out || d.out <= d.in) {
      setErr(f, "form", "La fecha de salida tiene que ser después de la de entrada.");
      return;
    }
    if (d.in < today()) {
      setErr(f, "form", "La fecha de entrada ya pasó. Elige una desde hoy en adelante.");
      return;
    }
    AGQ = { pais: d.pais, in: d.in, out: d.out };
    route(true);
  },
  register(f) {
    clearErrs(f);
    const v = (n) => (f.elements[n].value || "").trim();
    let ok = true;
    const e = (n, m) => {
      setErr(f, n, m);
      ok = false;
    };
    if (!v("nombre")) e("nombre", "Escribe tu nombre.");
    if (!v("apellido")) e("apellido", "Escribe tu apellido.");
    const em = v("email").toLowerCase();
    if (!/^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(em))
      e("email", "correo inválido");
    else if (users().some((u) => u.email === em))
      e("email", "Ya existe una cuenta con este correo. Inicia sesión.");
    const p = f.elements.pass.value;
    if (p.length < 8 || !/\d/.test(p)) e("pass", "Usa mínimo 8 caracteres con al menos un número.");
    if (f.elements.pass2.value !== p) e("pass2", "Las contraseñas no coinciden.");
    if (!f.elements.terms.checked)
      e("terms", "Necesitas aceptar los términos para crear la cuenta.");
    if (!ok) {
      const b = $(".bad", f);
      if (b) b.focus();
      return;
    }
    const u = { nombre: v("nombre"), apellido: v("apellido"), email: em, pass: p };
    store.set("users", users().concat(u));
    store.set("session", em);
    toast("¡Listo, " + u.nombre + "! Tu cuenta quedó creada.");
    go("#/");
  },
  login(f) {
    clearErrs(f);
    const em = (f.elements.email.value || "").trim().toLowerCase(),
      p = f.elements.pass.value;
    if (!em) {
      setErr(f, "email", "Escribe tu correo.");
      return;
    }
    if (!p) {
      setErr(f, "pass", "Escribe tu contraseña.");
      return;
    }
    const u = users().find((x) => x.email === em && x.pass === p);
    if (!u) {
      setErr(f, "form", "El correo o la contraseña no coinciden, revisa e inténtalo de nuevo.");
      return;
    }
    store.set("session", em);
    store.set("remember", !!(f.elements.remember && f.elements.remember.checked));
    go(f.dataset.next || "#/");
  },
  recover(f) {
    clearErrs(f);
    const em = (f.elements.email.value || "").trim();
    if (!/^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(em)) {
      setErr(f, "email", "Escribe un correo válido.");
      return;
    }
    $("#recover-box").innerHTML =
      '<h1>Revisa tu correo</h1><p class="sub" style="margin:10px 0 22px">Si ' +
      esc(em) +
      " tiene una cuenta en Airsoft, te enviamos un enlace para crear una nueva contraseña.</p>" +
      '<a class="btn btn-go btn-block" href="#/login">Volver a iniciar sesión</a>';
  },
  pay(f) {
    clearErrs(f);
    const pe = paxErrors(f);
    Object.entries(pe).forEach(([k, m]) => setErr(f, k, m));
    let ok = !Object.keys(pe).length;
    const v = (n) => (f.elements[n] ? (f.elements[n].value || "").replace(/\s/g, "") : "");
    const e = (n, m) => {
      setErr(f, n, m);
      ok = false;
    };
    Object.entries(payMethodErrors(f)).forEach(([k, m]) => e(k, m));
    if (!ok) {
      const b = $(".bad", f);
      if (b) b.focus();
      return;
    }
    const btn = $("#paybtn");
    btn.disabled = true;
    btn.textContent = "Procesando pago…";
    setTimeout(() => {
      const all = bookings();
      let code;
      do {
        code = "AIR-" + (1000 + Math.floor(Math.random() * 9000));
      } while (all.some((b) => b.code === code));
      const pax = {
        nombre: f.elements.nombre.value.trim(),
        apellido: f.elements.apellido.value.trim(),
        doc: v("doc"),
        email: me().email,
      };
      const bk = makeBooking(S.draft, pax, S.pay, code);
      bk.pax.notify = f.elements.email.value.trim();
      store.set("bookings", all.concat(bk));
      S.draft = null;
      saveDraft();
      location.hash = "#/confirmacion/" + code + "?nuevo=1";
    }, 1300);
  },
  contact(f) {
    clearErrs(f);
    const v = (n) => (f.elements[n].value || "").trim();
    let ok = true;
    if (!v("nombre")) {
      setErr(f, "nombre", "Escribe tu nombre.");
      ok = false;
    }
    const em = v("email").toLowerCase();
    if (!/^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(em)) {
      setErr(f, "email", "correo inválido");
      ok = false;
    }
    if (v("msg").length < 10) {
      setErr(f, "msg", "Cuéntanos en mínimo 10 caracteres.");
      ok = false;
    }
    if (!ok) return;
    f.reset();
    toast("Recibimos tu mensaje, te respondemos en menos de 24 horas.");
  },
};
document.addEventListener("submit", (e) => {
  const f = e.target;
  const h = f.dataset.form && (handlers[f.dataset.form] || PAGE_HANDLERS[f.dataset.form]);
  if (h) {
    e.preventDefault();
    h(f);
  }
});

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  const a = t.dataset.act;
  if (a === "menu") {
    const top = $("#top");
    const o = top.classList.toggle("open");
    t.setAttribute("aria-expanded", o);
  } else if (a === "logout") {
    store.del("session");
    toast("Cerraste sesión.");
    go("#/");
  } else if (a === "dest") {
    const dd = D[t.dataset.id];
    S.search.dest = dd.id;
    S.search.amb = dd.amb;
    S.search.pais = dd.amb === "int" ? dd.country : "";
    S.search.ag = "";
    saveSearch();
    F = resetF();
    go("#/resultados");
  } else if (a === "fchip") {
    const g = t.dataset.g,
      v = t.dataset.v;
    F[g] = F[g].includes(v) ? F[g].filter((x) => x !== v) : F[g].concat(v);
    t.classList.toggle("on");
    t.setAttribute("aria-pressed", F[g].includes(v));
    renderResultList();
  } else if (a === "fclear") {
    F = resetF();
    route(true);
  } else if (a === "hchip") {
    const g = t.dataset.g,
      v = t.dataset.v;
    HF[g] = HF[g].includes(v) ? HF[g].filter((x) => x !== v) : HF[g].concat(v);
    t.classList.toggle("on");
    t.setAttribute("aria-pressed", HF[g].includes(v));
    renderHotelList();
  } else if (a === "hclear") {
    HF = resetHF();
    route(true);
  } else if (a === "open-pkg") {
    const id = t.dataset.id;
    S.draft = null;
    ensureDraft(id);
    // HU-05: si el paquete lleva hotel, primero se elige el hotel y después se confirma
    go(P[id].hotel ? "#/hoteles?pkg=" + id : "#/paquete/" + id);
  } else if (a === "pick-hotel") {
    const h = H[t.dataset.id];
    const hs = S.hsearch;
    let pid =
      S.draft && P[S.draft.pkg].dest === h.dest && P[S.draft.pkg].hotel ? S.draft.pkg : null;
    if (!pid) {
      const c = PKGS.filter((p) => p.dest === h.dest && p.hotel);
      pid = (c.find((p) => p.plan === "vh") || c[0]).id;
      S.draft = {
        pkg: pid,
        origin: S.search.origin,
        start: hs.in,
        travelers: hs.guests,
        room: "std",
        hotel: h.id,
      };
    }
    S.draft.hotel = h.id;
    saveDraft();
    toast("Listo, tu paquete ahora incluye " + h.name + ".");
    go("#/paquete/" + pid);
  } else if (a === "reserve") {
    const dr = S.draft;
    const err = $("#b-err");
    if (!dr.start || dr.start < today()) {
      err.textContent = "Elige una fecha de salida desde hoy.";
      return;
    }
    if (isInt(P[dr.pkg].dest) && !trmDelDia()) {
      err.textContent = "La conversión no está disponible en este momento. Intenta de nuevo en unos minutos.";
      return;
    }
    if (P[dr.pkg].hotel && !dr.hotel) {
      err.textContent = "Elige un hotel para continuar.";
      return;
    }
    if (!me()) {
      toast("Inicia sesión para reservar.");
      go("#/login?next=" + encodeURIComponent("#/pago"));
    } else go("#/pago");
  } else if (a === "method") {
    S.pay = t.dataset.m;
    $$(".method").forEach((b) => {
      const on = b.dataset.m === S.pay;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", on);
    });
    $("#mfields").innerHTML = methodFields();
    updatePayBtn();
  } else if (a === "ag-ofertas") {
    const nac = AGQ.pais === "Colombia";
    S.search = Object.assign({}, S.search, {
      amb: nac ? "nac" : "int",
      pais: nac ? "" : AGQ.pais,
      dest: "",
      ag: t.dataset.ag,
      start: AGQ.in,
      end: AGQ.out,
    });
    saveSearch();
    F = resetF();
    go("#/resultados");
  } else if (a === "sim") {
    store.set("simular", t.dataset.v);
    route(true);
  } else if (a === "acepta-tasa") {
    const t = trmDelDia();
    if (t) {
      S.draft.tasa = t.valor;
      saveDraft();
    }
    route(true);
  } else if (a === "amb") {
    keepSearchFields();
    S.search.amb = t.dataset.v;
    S.search.dest = "";
    S.search.pais = "";
    $('form[data-form="search"]').outerHTML = searchForm();
  } else if (a === "pais-chip") {
    keepSearchFields();
    S.search.pais = t.dataset.v;
    S.search.dest = "";
    $('form[data-form="search"]').outerHTML = searchForm();
  } else if (a === "showpass") {
    const f = t.closest("form");
    $$('input[name="pass"], input[name="pass2"]', f).forEach((x) => (x.type = t.checked ? "text" : "password"));
  }
});

document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.range) {
    const r = $("#prange");
    const [a, b] = $$("input", r);
    if (+a.value > +b.value) {
      if (t === a) a.value = b.value;
      else b.value = a.value;
    }
    F.min = +a.value;
    F.max = +b.value;
    $("#rmin").textContent = fmtBase(F.min);
    $("#rmax").textContent = fmtBase(F.max);
    syncRange("#prange", +a.min, +a.max);
    renderResultList();
  } else if (t.dataset.hrange) {
    const r = $("#hrange");
    const [a, b] = $$("input", r);
    if (+a.value > +b.value) {
      if (t === a) a.value = b.value;
      else b.value = a.value;
    }
    HF.min = +a.value;
    HF.max = +b.value;
    const fh = isInt(S.hsearch.dest) ? usd : money;
    $("#hmin").textContent = fh(HF.min);
    $("#hmax").textContent = fh(HF.max);
    syncRange("#hrange", +a.min, +a.max);
    renderHotelList();
  } else if (t.dataset.fmt === "card") {
    const d = t.value.replace(/\D/g, "").slice(0, 16);
    t.value = d.replace(/(\d{4})(?=\d)/g, "$1 ");
  } else if (t.dataset.fmt === "exp") {
    let d = t.value.replace(/\D/g, "").slice(0, 4);
    if (d.length > 2) d = d.slice(0, 2) + "/" + d.slice(2);
    t.value = d;
  } else if (t.hasAttribute("data-pax")) checkStep1();
  if (t.closest('form[data-form="pay"]')) updatePayBtn();
  if (t.closest('form[data-form="register"]') && t.name === "email") updateRegBtn();
  if (t.classList.contains("bad")) {
    t.classList.remove("bad");
    const f = t.closest("form");
    const el = f && f.querySelector('[data-err="' + t.name + '"]');
    if (el) el.textContent = "";
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.name === "pais" && t.closest('form[data-form="search"]')) {
    keepSearchFields();
    S.search.pais = t.value;
    S.search.dest = "";
    t.closest("form").outerHTML = searchForm();
    return;
  }
  if (t.dataset.act === "rsort") {
    F.sort = t.value;
    renderResultList();
  } else if (t.dataset.act === "hsort") {
    HF.sort = t.value;
    renderHotelList();
  } else if (t.dataset.draft) {
    const k = t.dataset.draft;
    S.draft[k] = k === "travelers" ? +t.value : t.value;
    if (k === "start" && (!t.value || t.value < today())) {
      $("#b-err").textContent = "Elige una fecha de salida desde hoy en adelante.";
      return;
    }
    saveDraft();
    route(true);
  }
});
window.addEventListener("hashchange", () => route());

seed();
seedCancelada();
// HU-03: si no marcó "Recordarme", la sesión termina al cerrar el navegador
try {
  if (store.get("remember", true) === false && !sessionStorage.getItem("airsoft:abierta"))
    store.del("session");
  sessionStorage.setItem("airsoft:abierta", "1");
} catch (e) {}
route();
