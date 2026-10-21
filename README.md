
# Airsoft · Sitio web 

Sitio navegable de la agencia de viajes Airsoft, construido a partir de los mockups del Manual de Marca v1.0. Usa datos simulados, sin backend: las cuentas y reservas se guardan en el navegador con `localStorage`.

## Cómo abrirlo

1. Descomprime el `.zip` y abre la carpeta `airsoft` en Visual Studio Code (Archivo > Abrir carpeta).
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Clic derecho sobre `index.html` > **Open with Live Server**. Se abre en Chrome en `http://127.0.0.1:5500`.

También funciona con doble clic sobre `index.html`, sin Live Server.

## Cuenta de prueba

- Correo: `demo@airsoft.co`
- Contraseña: `Viaja2026`
- Tarjeta de prueba: `4111 1111 1111 1111`, vencimiento `08/29`, CVV `123`

## Estructura

```
airsoft/
├── index.html        Estructura base: encabezado, pie de página y guía de la demo
├── assets/logo.png   Isotipo tomado del manual de marca
├── css/styles.css    Colores, tipografía y diseño responsive
└── js/
    ├── utils.js      Formato de fechas y precios, almacenamiento local
    ├── data.js       Destinos, hoteles, paquetes e itinerarios simulados
    ├── state.js      Estado de la app, cuenta de prueba y cálculo de precios
    ├── ui.js         Avisos, encabezado y buscador
    ├── views.js      Una función por pantalla (vHome, vResults, vDetail...)
    ├── pages.js      Páginas institucionales: vacantes, blog, ayuda y términos (HU-09 a HU-12)
    └── app.js        Enrutador por hash (#/...) y manejo de eventos
```

Los scripts se cargan en ese orden en `index.html`, porque cada archivo usa lo que definen los anteriores.

## Pantallas por historia de usuario

| HU | Pantalla | Ruta | Función en `views.js` |
|----|----------|------|-----------------------|
| 1 | Inicio y buscador | `#/` | `vHome` |
| 2 | Registro | `#/registro` | `vAuth("registro")` |
| 3 | Inicio de sesión | `#/login` | `vAuth("login")` |
| 4 | Búsqueda de paquetes | `#/resultados` | `vResults` |
| 5 | Selección de hotel | `#/hoteles` | `vHotels` |
| 6 | Detalle del paquete | `#/paquete/c1` | `vDetail` |
| 7 | Pago | `#/pago` | `vPay` |
| 8 | Confirmación y mis reservas | `#/confirmacion/...`, `#/mis-reservas` | `vConfirm`, `vMine` |
| 9 | Trabaja con nosotros | `#/trabaja`, `#/trabaja/aplicar/...` | `vCarreras`, `vAplicar` (en `pages.js`) |
| 10 | Artículo del blog | `#/blog`, `#/blog/razones-cartagena` | `vBlog`, `vArticulo` (en `pages.js`) |
| 11 | Centro de ayuda | `#/ayuda` | `vAyuda` (en `pages.js`) |
| 12 | Términos y condiciones | `#/terminos` | `vTerminos` (en `pages.js`) |

## Para conectar el backend

Los datos viven en `js/data.js` (catálogo) y en `localStorage` (usuarios y reservas, ver `store` en `js/utils.js`). Para pasar a una API, se reemplazan esas lecturas y escrituras por llamadas `fetch` sin tocar las vistas.

## Subirlo a GitHub

1. Crea un repositorio vacío en GitHub (sin README ni .gitignore).
2. En VS Code abre la terminal (Terminal > Nueva terminal) dentro de la carpeta `airsoft` y ejecuta:

```bash
git init
git add .
git commit -m "Demo navegable de Airsoft para el sprint review"
git branch -M main
git remote add origin https://github.com/USUARIO/NOMBRE-DEL-REPO.git
git push -u origin main
```

Cambia `USUARIO` y `NOMBRE-DEL-REPO` por los de tu repositorio.
