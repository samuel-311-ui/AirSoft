/* Airsoft · Páginas institucionales (HU-09 a HU-12):
   Trabaja con nosotros, Blog de viajes, Centro de ayuda y Términos y condiciones */
"use strict";

/* ---------- HU-09 · Trabaja con nosotros ---------- */

// Para cerrar una vacante basta con poner abierta: false. Deja de mostrarse sola.
const VACANTES = [
  {
    id: "frontend",
    titulo: "Desarrollador/a Frontend",
    area: "Tecnología",
    ciudad: "Medellín",
    contrato: "Tiempo completo",
    modalidad: "Presencial / Híbrido",
    abierta: true,
  },
  {
    id: "asesor",
    titulo: "Asesor/a de viajes",
    area: "Servicio al cliente",
    ciudad: "Bogotá",
    contrato: "Tiempo completo",
    modalidad: "Presencial / Híbrido",
    abierta: true,
  },
  {
    id: "ux",
    titulo: "Diseñador/a UX/UI",
    area: "Producto",
    ciudad: "Remoto",
    contrato: "Tiempo completo",
    modalidad: "Remoto",
    abierta: true,
  },
  {
    id: "marketing",
    titulo: "Analista de marketing digital",
    area: "Marketing",
    ciudad: "Medellín",
    contrato: "Medio tiempo",
    modalidad: "Presencial / Híbrido",
    abierta: true,
  },
  {
    id: "practicante",
    titulo: "Practicante de comunicaciones",
    area: "Marketing",
    ciudad: "Medellín",
    contrato: "Práctica",
    modalidad: "Presencial / Híbrido",
    abierta: true,
  },
  {
    id: "backend",
    titulo: "Desarrollador/a Backend",
    area: "Tecnología",
    ciudad: "Medellín",
    contrato: "Tiempo completo",
    modalidad: "Presencial / Híbrido",
    abierta: false,
  },
];
const vacantesAbiertas = () => VACANTES.filter((v) => v.abierta);
let areaFiltro = "";

function vCarreras() {
  const lista = vacantesAbiertas();
  const areas = [...new Set(lista.map((v) => v.area))];
  return {
    title: "Trabaja con nosotros · Airsoft",
    html:
      '<section class="soft-hero"><div class="container"><div class="kicker-g">TRABAJA CON NOSOTROS</div><h1>Construyamos juntos la forma de viajar de más personas</h1><p>Somos un equipo pequeño y cercano que cree que planear un viaje debería sentirse tan bien como vivirlo. Si te gusta resolver problemas reales para personas reales, este es tu lugar.</p></div></section>' +
      '<section class="section"><div class="container narrow"><div class="sec-head"><div><h2>Vacantes abiertas</h2><p class="sub" id="vcount"></p></div></div>' +
      '<div class="chips" style="margin-bottom:20px"><button class="chip' +
      (areaFiltro ? "" : " on") +
      '" data-pg="area" data-v="">Todas las áreas</button>' +
      areas
        .map(
          (a) =>
            '<button class="chip' +
            (areaFiltro === a ? " on" : "") +
            '" data-pg="area" data-v="' +
            esc(a) +
            '">' +
            esc(a) +
            "</button>",
        )
        .join("") +
      '</div><div id="vlist"></div></div></section>' +
      '<section style="padding-bottom:64px"><div class="container"><div class="band"><h2>¿No ves una vacante para ti? Escríbenos de todas formas.</h2><a class="btn btn-white" href="#/trabaja/aplicar/general">Enviar hoja de vida</a></div></div></section>',
    after: renderVacantes,
  };
}
function renderVacantes() {
  const l = vacantesAbiertas().filter((v) => !areaFiltro || v.area === areaFiltro);
  $("#vcount").textContent =
    plural(l.length, "posición disponible", "posiciones disponibles") + " esta semana";
  $("#vlist").innerHTML = l
    .map(
      (v) =>
        '<article class="row vac"><div><h3>' +
        esc(v.titulo) +
        '</h3><p class="m">' +
        esc(v.area) +
        " · " +
        esc(v.ciudad) +
        '</p><div class="tags"><span class="tag soft">' +
        esc(v.contrato) +
        '</span><span class="tag soft">' +
        esc(v.modalidad) +
        '</span></div></div><a class="btn btn-go" href="#/trabaja/aplicar/' +
        v.id +
        '">Aplicar</a></article>',
    )
    .join("");
}

function vAplicar(id) {
  const general = id === "general";
  const v = VACANTES.find((x) => x.id === id && x.abierta);
  if (!general && !v)
    return { redirect: "#/trabaja", msg: "Esa vacante ya no esta disponible." };
  const u = me();
  return {
    title: "Aplicar · Airsoft",
    html:
      '<div class="conf" style="max-width:640px"><a class="btn btn-text" href="#/trabaja" style="padding-left:0">← Volver a las vacantes</a>' +
      '<h1 style="text-align:left;margin-top:8px">' +
      (general ? "Envíanos tu hoja de vida" : esc(v.titulo)) +
      "</h1>" +
      '<p class="sub" style="margin:6px 0 24px">' +
      (general
        ? "La guardamos y te escribimos cuando abra una vacante que encaje contigo."
        : esc(v.area + "," + v.ciudad + "," + v.contrato)) +
      "</p>" +
      '<form data-form="apply" data-vac="' +
      esc(id) +
      '" class="stack" novalidate>' +
      '<div class="grid2"><div class="field"><label for="a-n">Nombre completo</label><input id="a-n" name="nombre" class="input"="' +
      esc(u ? u.nombre + " " + u.apellido : "") +
      '"><div class="err" data-err="nombre"></div></div>' +
      '<div class="field"><label for="a-e">Correo electrónico</label><input id="a-e" name="email" type="email" class="input"="' +
      esc(u ? u.email : "") +
      '"><div class="err" data-err="email"></div></div></div>' +
      '<div class="field"><label for="a-c">hoja de vida</label><input id="a-c" name="cv" type="file" class="input file" accept=".pdf,.doc,.docx"><div class="err" data-err="cv"></div></div>' +
      '<div class="field"><label for="a-m">Cuéntanos por qué te interesa</label><textarea id="a-m" name="msg" class="input"></textarea></div>' +
      '<button class="btn btn-go" type="submit">Enviar postulación</button></form></div>',
  };
}

/* ---------- HU-10 · Blog de viajes ---------- */

const ARTICULOS = [
  {
    slug: "razones-cartagena",
    dest: "ctg",
    cat: "Destinos · Colombia",
    autor: "",
    fecha: "",
    titulo: "7 razones para conocer Cartagena al menos una vez en la vida",
    intro:
      "Cartagena junta historia colonial, comida costeña y algunos de los atardeceres más fotografiados del Caribe. Si todavía la tienes pendiente, aquí van las razones para subirla en tu lista.",
    secciones: [
      [
        "La ciudad amurallada es un museo al aire libre",
        "Caminar por el centro histórico es como retroceder cinco siglos. Las calles empedradas, los balcones con flores y las plazas hacen que cada esquina se sienta distinta a la anterior.",
      ],
      [
        "Las islas del Rosario están a una hora en lancha",
        "Agua turquesa, arrecifes de coral y arena blanca. Es una excursión de día completo que puedes sumar a cualquier paquete todo incluido.",
      ],
      [
        "La comida es una razón por sí sola",
        "Desde el pescado frito con patacón hasta la arepa de huevo de puesto callejero, Cartagena se disfruta tanto con los ojos como con el paladar.",
      ],
      [
        "Los atardeceres en la muralla son gratis",
        "Cada tarde, locales y viajeros se sientan sobre la muralla a ver caer el sol sobre el mar. Es uno de los planes más simples y más recordados de la ciudad.",
      ],
      [
        "Getsemaní tiene la mejor vida de barrio",
        "Murales, música en la plaza de la Trinidad y restaurantes pequeños. Es el lugar para salir de noche sin alejarte del centro.",
      ],
      [
        "Hay playa para cada gusto",
        "Bocagrande queda a pasos de los hoteles, y si buscas algo más tranquilo, playa Blanca en Barú vale el viaje.",
      ],
      [
        "Llegar es fácil",
        "Hay vuelos directos desde Medellín, Bogotá y Cali, y en un fin de semana largo alcanzas a verla bien.",
      ],
    ],
  },
  {
    slug: "guia-san-andres",
    dest: "adz",
    cat: "Destinos · Colombia",
    autor: "",
    fecha: "",
    titulo: "San Andrés en 4 días: guía para tu primer viaje",
    intro:
      "San Andrés es pequeña, pero tiene más planes de los que caben en un fin de semana. Esta guía te ayuda a repartir los días sin correr.",
    secciones: [
      [
        "Día 1: llegada y Spratt Bight",
        "Deja las maletas y camina hasta la playa principal. La peatonal tiene restaurantes y tiendas para la primera noche.",
      ],
      [
        "Día 2: vuelta a la isla",
        "Alquila una mula o un carrito de golf y recorre La Loma, el Hoyo Soplador y West View, donde puedes nadar con peces.",
      ],
      [
        "Día 3: Johnny Cay y el Acuario",
        "Sal temprano en lancha. Lleva protector solar biodegradable y efectivo para el almuerzo en el cayo.",
      ],
      [
        "Día 4: San Luis y despedida",
        "La costa de San Luis es más tranquila y perfecta para cerrar el viaje antes de ir al aeropuerto.",
      ],
    ],
  },
  {
    slug: "madrid-primera-vez",
    dest: "mad",
    cat: "Destinos · Europa",
    autor: "",
    fecha: "",
    titulo: "Madrid por primera vez: lo que nadie te cuenta",
    intro:
      "Madrid es una ciudad para caminar y comer tarde. Estos consejos te ahorran tiempo y dinero desde el primer día.",
    secciones: [
      [
        "Los horarios son otros",
        "Se almuerza a las 2:00 p. m. y se cena después de las 9:00 p. m. Si llegas a un restaurante a las 7:00, lo vas a encontrar vacío.",
      ],
      [
        "El Prado es gratis las últimas dos horas",
        "De lunes a sábado, desde las 6:00 p. m., la entrada no cuesta. Llega con tiempo porque la fila crece rápido.",
      ],
      [
        "El metro te lleva a todas partes",
        "La tarjeta multi se recarga en cualquier estación y sirve para metro y bus.",
      ],
      [
        "Toledo vale la excursión",
        "En tren rápido llegas en 30 minutos a una ciudad medieval que se recorre en un día.",
      ],
    ],
  },
];
const minutosLectura = (a) =>
  Math.max(2, Math.round((a.intro + a.secciones.flat().join(" ")).split(/\s+/).length / 120));
const guardados = () => store.get("guardados", []);

function vBlog() {
  const g = guardados();
  return {
    title: "Blog de viajes",
    html:
      '<section class="sky"><div class="container page-sky"><h1>Blog de viajes</h1><p>Ideas, guías y consejos para elegir tu próximo destino.</p></div></section>' +
      '<section class="section"><div class="container"><div class="dest-grid blog-grid">' +
      ARTICULOS.map((a) => articuloCard(a, g.includes(a.slug))).join("") +
      "</div></div></section>",
  };
}
function articuloCard(a, guardado) {
  return (
    '<a class="dest" href="#/blog/' +
    a.slug +
    '" style="text-decoration:none"><div class="ph" style="background:' +
    D[a.dest].grad +
    '"><b>' +
    esc(D[a.dest].name) +
    "</b><small>" +
    esc(D[a.dest].country) +
    '</small></div><div class="meta">' +
    esc(a.cat) +
    (guardado ? " · Guardado" : "") +
    '</div><div class="from" style="font-size:.92rem">' +
    esc(a.titulo) +
    "</div></a>"
  );
}
function vArticulo(slug) {
  const a = ARTICULOS.find((x) => x.slug === slug);
  if (!a) return vNotFound();
  const d = D[a.dest];
  const g = guardados().includes(a.slug);
  const otros = ARTICULOS.filter((x) => x.slug !== slug);
  const m = minPkg(a.dest);
  return {
    title: a.titulo + " · Airsoft",
    html:
      '<section class="dhero" style="background:linear-gradient(120deg,#003E8A,#1FB081)"><div class="container"><div class="kicker" style="color:#8EEBC8;position:relative">' +
esc(a.cat.toUpperCase()) +
'</div><h1 style="max-width:22ch;margin-top:8px">' +
esc(a.titulo) +
"</h1></div></section>"+
      '<article class="post"><p>' +
      esc(a.intro) +
      "</p>" +
      a.secciones
        .map(([t, x], i) => "<h2>" + (i + 1) + ". " + esc(t) + "</h2><p>" + esc(x) + "</p>")
        .join("") 
      
  };
}

/* ---------- HU-11 · Centro de ayuda ---------- */

const FAQ_CATS = [
  ["reservas", "Reservas"],
  ["pagos", "Pagos"],
  ["cambios", "Cambios y cancelaciones"],
  ["cuenta", "Cuenta"],
  ["viaje", "Durante el viaje"],
];
const FAQ = [
  [
    "reservas",
    "¿como reservo un paquete turístico?",
    "Busca tu destino y fechas en el inicio, elige un paquete y da clic en Reservar ahora. Necesitas una cuenta para pagar, pero tu selección queda guardada mientras inicias sesión.",
  ],
  [
    "reservas",
    "¿puedo reservar solo el vuelo o solo el hotel?",
    "Sí. En los resultados filtra por Solo vuelo, o entra a la selección de hoteles desde cualquier paquete para cambiar el alojamiento.",
  ],
  [
    "reservas",
    "¿Dónde veo mis reservas?",
    "En Mis reservas, arriba a la derecha cuando inicias sesión. Ahí ves el estado, el código y el detalle de cada viaje.",
  ],
  [
    "pagos",
    "¿que métodos de pago aceptan?",
    "Tarjeta de crédito, PSE, billeteras como Nequi y Daviplata, y pago en cuotas con tarjeta.",
  ],
  [
    "pagos",
    "¿puedo pagar mi paquete en cuotas?",
    "Sí, en 3, 6 o 12 cuotas sin intereses con tarjeta de crédito. Eliges el número de cuotas en el paso de pago.",
  ],
  [
    "pagos",
    "¿Es seguro pagar con tarjeta en el sitio?",
    "Sí. Los datos de tu tarjeta viajan cifrados y Airsoft no los guarda después del pago.",
  ],
  [
    "cambios",
    "¿puedo cambiar la fecha de mi viaje?",
    "Sí, según la disponibilidad de la aerolínea y el hotel. El cambio puede generar una diferencia de tarifa. Escríbenos desde Contacto con tu código de reserva.",
  ],
  [
    "cambios",
    "¿Cuál es la política de cancelación?",
    "Puedes cancelar sin costo hasta 48 horas antes del viaje desde Mis reservas. El reembolso llega a tu medio de pago en 5 a 8 días hábiles.",
  ],
  [
    "cuenta",
    "Olvidé mi contraseña, que hago?",
    "Escríbenos desde Contacto con el correo de tu cuenta y te ayudamos a recuperarla.",
  ],
  [
    "cuenta",
    "¿Puedo cambiar el correo de mi cuenta?",
    "Por ahora no desde el sitio. Escríbenos y lo cambiamos por ti después de verificar tu identidad.",
  ],
  [
    "viaje",
    "¿Qué hago si pierdo mi vuelo?",
    "Llámanos de inmediato. Te ayudamos a buscar el siguiente vuelo disponible con la aerolínea.",
  ],
  [
    "viaje",
    "¿Qué cubre la asistencia médica?",
    "Atención por enfermedad o accidente durante el viaje en los paquetes que la incluyen. Revisa la sección Qué incluye de tu paquete.",
  ],
];
let faqCat = "";

function vAyuda() {
  return {
    title: "Centro de ayuda · Airsoft",
    html:
      '<section class="soft-hero"><div class="container"><div class="kicker-g">CENTRO DE AYUDA</div><h1>¿En qué te podemos ayudar?</h1><p>Encuentra respuestas rápidas sobre reservas, pagos y cambios en tu viaje.</p>' +
      '<label class="sr" for="faq-q">Buscar en el centro de ayuda</label><input id="faq-q" class="input faq-search" type="search" autocomplete="off"></div></section>' +
      '<section class="section"><div class="container narrow"><div class="chips" style="margin-bottom:24px"><button class="chip' +
      (faqCat ? "" : " on") +
      '" data-pg="faqcat" data-v="">Todas</button>' +
      FAQ_CATS.map(
        ([k, l]) =>
          '<button class="chip' +
          (faqCat === k ? " on" : "") +
          '" data-pg="faqcat" data-v="' +
          k +
          '">' +
          l +
          "</button>",
      ).join("") +
      '</div><div id="faq" aria-live="polite"></div>' +
      '<div class="help-band"><div><p>Nuestro equipo te respondera todos los días, de 7:00 am a 9:00 pm</p></div><a class="btn btn-go" href="#/contacto">Contactar soporte</a></div></div></section>',
    after: renderFaq,
  };
}
function renderFaq() {
  const q = norm($("#faq-q") ? $("#faq-q").value : "");
  const palabras = q.split(/\s+/).filter((w) => w.length > 2);
  const coincide = (f) =>
    !palabras.length || palabras.every((w) => norm(f[1] + " " + f[2]).includes(w));
  let html = "";
  FAQ_CATS.forEach(([k, l]) => {
    if (faqCat && faqCat !== k) return;
    const items = FAQ.filter((f) => f[0] === k && coincide(f));
    if (!items.length) return;
    html +=
      '<h3 class="faq-cat">' +
      l +
      "</h3>" +
      items
        .map(
          (f) =>
            '<details class="faq-item"' +
            (palabras.length ? " open" : "") +
            "><summary>" +
            esc(f[1]) +
            "</summary><p>" +
            esc(f[2]) +
            "</p></details>",
        )
        .join("");
  });
  $("#faq").innerHTML =
    html ||
    '<div class="empty">No encontramos respuestas para esa búsqueda. Prueba con otra palabra o escríbele a soporte.<br><a class="btn btn-go" href="#/contacto">Contactar soporte</a></div>';
}

/* ---------- HU-12 · Términos y condiciones ---------- */

let tocLock = 0;
const TERMINOS_FECHA = "2020-09-01";
const TERMINOS = [
  [
    "aceptacion",
    "Aceptación de los términos",
    "Al usar el sitio de airsoft y hacer una reserva, aceptas estos términos, si no estás de acuerdo con alguno, te pedimos no continuar con la reserva",
  ],
  [
    "reservas",
    "Reservas y pagos",
    "una reserva queda confirmada cuando se completa el pago. Los precios que ves incluyen impuestos, salvo que se indique lo contrario y dependen de la disponibilidad al momento del pago.",
  ],
  [
    "cambios",
    "Cambios y cancelaciones",
    "Puedes cancelar sin costo hasta 48 horas antes del inicio del viaje desde mis reservas, después de ese plazo aplica la política de cada aerolínea u hotel",
  ],
  [
    "viajero",
    "Responsabilidad del viajero",
    "cada viajero debe tener al día los documentos que pida su destino, Airsoft solo es intermediarioentre el viajero y los proveedores de vuelos y hoteles",
  ],
  [
    "datos",
    "Datos personales",
    "Usamos la información que nos das al registrarte y reservar solo para gestionar tu viaje y avisarte de cambios importantes, según nuestra política de tratamiento de datos y la Ley 1581 de 2012.",
  ],
  [
    "contacto",
    "Contacto",
    "Si tienes preguntas sobre estos términos, escríbenos desde el centro de ayuda o al correo hola@airsoft.co",
  ],
];

function vTerminos() {
  return {
    title: "Términos y condiciones · Airsoft",
    html:
      '<section class="soft-hero"><div class="container"><h1>Términos y condiciones</h1><p>actualizado al: ' +
      fDay(TERMINOS_FECHA) +
      "</p></div></section>" +
      '<div class="container terms"><nav class="toc" aria-label="Secciones">' +
      TERMINOS.map(
        ([id, t], i) =>
          '<button data-pg="toc" data-id="' +
          id +
          '"' +
          (i === 0 ? ' class="on"' : "") +
          ">" +
          (i + 1) +
          ". " +
          t +
          "</button>",
      ).join("") +
      "</nav><div>" +
      TERMINOS.map(
        ([id, t, x], i) =>
          '<section id="t-' +
          id +
          '" class="tsec"><h2>' +
          (i + 1) +
          ". " +
          t +
          "</h2><p>" +
          x +
          "</p></section>",
      ).join("") +
      "</div></div>",
    after: () => {
      // Marca en el menú la sección que se está leyendo
      if (!("IntersectionObserver" in window)) return;
      const obs = new IntersectionObserver(
        (ents) =>
          ents.forEach((e) => {
            if (!e.isIntersecting || Date.now() < tocLock) return;
            const id = e.target.id.slice(2);
            $$(".toc button").forEach((b) => b.classList.toggle("on", b.dataset.id === id));
          }),
        { rootMargin: "-100px 0px -65% 0px" },
      );
      $$(".tsec").forEach((s) => obs.observe(s));
    },
  };
}

/* ---------- eventos de estas páginas ---------- */

const PAGE_HANDLERS = {
  apply(f) {
    clearErrs(f);
    const v = (n) => (f.elements[n].value || "").trim();
    let ok = true;
    if (!v("nombre")) {
      setErr(f, "nombre", "Escribe tu nombre.");
      ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) {
      setErr(f, "email", "Revisa el correo, parece que le falta algo.");
      ok = false;
    }
    const file = f.elements.cv.files[0];
    if (!file) {
      setErr(f, "cv", "Adjunta tu hoja de vida.");
      ok = false;
    } else if (!/\.(pdf|docx?)$/i.test(file.name)) {
      setErr(f, "cv", "La hoja de vida debe ser PDF o Word.");
      ok = false;
    } else if (file.size > 5 * 1024 * 1024) {
      setErr(f, "cv", "El archivo pesa más de 5 MB.");
      ok = false;
    }
    if (!ok) return;
    // Solo guardamos el nombre del archivo: es una demo sin servidor
    store.set(
      "postulaciones",
      store.get("postulaciones", []).concat({
        vacante: f.dataset.vac,
        nombre: v("nombre"),
        email: v("email"),
        archivo: file.name,
        fecha: today(),
      }),
    );
    toast(
      "Recibimos tu hoja de vida, " +
        v("nombre").split(" ")[0] +
        ". Te escribimos si avanzas en el proceso.",
    );
    go("#/trabaja");
  },
};

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-pg]");
  if (!t) return;
  const a = t.dataset.pg;
  if (a === "area") {
    areaFiltro = t.dataset.v;
    $$('[data-pg="area"]').forEach((b) => b.classList.toggle("on", b === t));
    renderVacantes();
  } else if (a === "faqcat") {
    faqCat = t.dataset.v;
    $$('[data-pg="faqcat"]').forEach((b) => b.classList.toggle("on", b === t));
    renderFaq();
  } else if (a === "toc") {
    const s = document.getElementById("t-" + t.dataset.id);
    $$(".toc button").forEach((b) => b.classList.toggle("on", b === t));
    tocLock = Date.now() + 1200; // evita que el scroll cambie la sección marcada
    if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (a === "save") {
    const slug = t.dataset.slug;
    let g = guardados();
    const on = !g.includes(slug);
    g = on ? g.concat(slug) : g.filter((x) => x !== slug);
    store.set("guardados", g);
    t.classList.toggle("on", on);
    t.setAttribute("aria-pressed", on);
    t.textContent = on ? "Guardado ✓" : "Guardar";
    toast(
      on
        ? "Guardamos el artículo para que lo leas después."
        : "Quitamos el artículo de tus guardados.",
    );
  } else if (a === "share") {
    const url = location.href;
    if (navigator.share) navigator.share({ title: document.title, url }).catch(() => {});
    else if (navigator.clipboard)
      navigator.clipboard.writeText(url).then(
        () => toast("Copiamos el enlace del artículo."),
        () => toast("Copia este enlace: " + url),
      );
    else toast("Copia este enlace: " + url);
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "faq-q") renderFaq();
});
