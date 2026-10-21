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
  $("#guide").classList.remove("open");
  $(".gbtn").setAttribute("aria-expanded", "false");
  if (!keep) window.scrollTo(0, 0);
}

/* ---------- events ---------- */
const handlers = {
  search(f) {
    clearErrs(f);
    const d = Object.fromEntries(new FormData(f));
    let dest = "";
    if (d.dest.trim()) {
      const m = matchDest(d.dest);
      if (!m) {
        setErr(
          f,
          "form",
          "Todavía no tenemos paquetes a “" +
            d.dest.trim() +
            "”. Prueba con Cartagena, Cancún, San Andrés o Madrid.",
        );
        return;
      }
      dest = m.id;
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
    S.search = { origin: d.origin, dest, start: d.start, end: d.end, travelers: +d.travelers };
    saveSearch();
    F = resetF();
    S.draft = null;
    saveDraft();
    go("#/resultados");
  },
  hsearch(f) {
    clearErrs(f);
    const d = Object.fromEntries(new FormData(f));
    if (!d.in || !d.out || d.out <= d.in) {
      setErr(f, "form", "El check-out tiene que ser después del check-in.");
      return;
    }
    if (d.in < today()) {
      setErr(f, "form", "La fecha de check-in ya pasó. Elige una desde hoy en adelante.");
      return;
    }
    const changed = d.dest !== S.hsearch.dest;
    S.hsearch = { dest: d.dest, in: d.in, out: d.out, guests: +d.guests };
    if (changed) HF = resetHF();
    if (location.hash.indexOf("pkg=") > -1 || changed)
      history.replaceState(null, "", "#/hoteles?destino=" + d.dest);
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))
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
    go(f.dataset.next || "#/");
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
    go(f.dataset.next || "#/");
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
    if (S.pay === "tarjeta" || S.pay === "cuotas") {
      if (!/^\d{16}$/.test(v("card"))) e("card", "El número de tarjeta debe tener 16 dígitos.");
      const m = v("exp").match(/^(\d{2})\/(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) e("exp", "Usa el formato MM/AA.");
      else {
        const now = new Date();
        const y = 2000 + +m[2];
        if (y < now.getFullYear() || (y === now.getFullYear() && +m[1] < now.getMonth() + 1))
          e("exp", "Esta tarjeta ya venció.");
      }
      if (!/^\d{3,4}$/.test(v("cvv"))) e("cvv", "El CVV son los 3 o 4 números al respaldo.");
    } else if (S.pay === "pse") {
      if (!v("bank")) e("bank", "Elige tu banco.");
    } else if (!/^3\d{9}$/.test(v("cel")))
      e("cel", "Escribe un celular de 10 dígitos que empiece por 3.");
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) {
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
  if (!t) {
    if (!e.target.closest("#guide")) $("#guide").classList.remove("open");
    return;
  }
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
    S.search.dest = t.dataset.id;
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
    go("#/paquete/" + id);
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
  } else if (a === "fill-demo") {
    const f = t.closest("form");
    f.elements.email.value = "demo@airsoft.co";
    f.elements.pass.value = "Viaja2026";
  } else if (a === "cancel") {
    if (!t.dataset.armed) {
      t.dataset.armed = "1";
      t.textContent = "Sí, cancelar esta reserva";
      return;
    }
    const all = bookings();
    const b = all.find((x) => x.code === t.dataset.code);
    if (b) {
      b.status = "Cancelada";
      store.set("bookings", all);
    }
    toast("Cancelamos tu reserva. El reembolso llega a tu medio de pago en 5 a 8 días hábiles.");
    route(true);
  } else if (a === "guide") {
    const g = $("#guide");
    const o = g.classList.toggle("open");
    t.setAttribute("aria-expanded", o);
    e.stopPropagation();
  } else if (a === "hu-pay") {
    if (!S.draft) {
      S.search.dest = "ctg";
      saveSearch();
      ensureDraft("c1");
    }
  
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
    $("#rmin").textContent = money(F.min);
    $("#rmax").textContent = money(F.max);
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
    $("#hmin").textContent = money(HF.min);
    $("#hmax").textContent = money(HF.max);
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
  if (t.classList.contains("bad")) {
    t.classList.remove("bad");
    const f = t.closest("form");
    const el = f && f.querySelector('[data-err="' + t.name + '"]');
    if (el) el.textContent = "";
  }
});
document.addEventListener("change", (e) => {
  const t = e.target;
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
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    $("#guide").classList.remove("open");
    $(".gbtn").setAttribute("aria-expanded", "false");
  }
});
window.addEventListener("hashchange", () => route());

seed();
route();
