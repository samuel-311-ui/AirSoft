/* Airsoft · Utilidades: formato de fechas, precios y almacenamiento local */
"use strict";

const LOGO = "assets/logo.png";
const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) =>
  String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const money = (n) =>
  "$" +
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const pD = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const iso = (d) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");
const addDays = (s, n) => {
  const d = pD(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const today = () => iso(new Date());
const daysBetween = (a, b) => Math.round((pD(b) - pD(a)) / 864e5);
const fDay = (s, y = true) => {
  const d = pD(s);
  return d.getDate() + " " + MON[d.getMonth()] + (y ? " " + d.getFullYear() : "");
};
const fRange = (a, b, y = false) => {
  const A = pD(a),
    B = pD(b);
  const tail = y ? " " + B.getFullYear() : "";
  return A.getMonth() === B.getMonth()
    ? A.getDate() + " - " + B.getDate() + " " + MON[B.getMonth()] + tail
    : A.getDate() + " " + MON[A.getMonth()] + " - " + B.getDate() + " " + MON[B.getMonth()] + tail;
};
const plural = (n, a, b) => n + " " + (n === 1 ? a : b);

/* ---------- storage ---------- */
const mem = {};
const store = {
  get(k, def) {
    try {
      const v = localStorage.getItem("airsoft:" + k);
      if (v != null) return JSON.parse(v);
    } catch (e) {}
    return k in mem ? mem[k] : def;
  },
  set(k, v) {
    mem[k] = v;
    try {
      localStorage.setItem("airsoft:" + k, JSON.stringify(v));
    } catch (e) {}
  },
  del(k) {
    delete mem[k];
    try {
      localStorage.removeItem("airsoft:" + k);
    } catch (e) {}
  },
};
