#!/usr/bin/env node
/* ============================================================
   Variedades Dianery — Precompilación de JSX para producción.

   Transpila los .jsx (cargados como <script type="text/babel">) a .js
   plano usando @babel/standalone, para que el navegador NO tenga que
   cargar Babel (~3 MB) ni compilar en cada visita. Solo corre en el
   deploy; en desarrollo se sigue sirviendo .jsx + Babel (sin build).

   Uso: node tools/precompile.js <directorioBase>
        (el <directorioBase> es la carpeta lista para subir, p. ej. deploy/)

   - Solo transpila JSX (preset "react"): el resto del código (arrow fns,
     optional chaining, etc.) queda como ES moderno nativo, soportado por
     los navegadores actuales. No se baja a ES5 para mantenerlo liviano.
   - Escribe el .js junto al original y elimina el .jsx de la salida
     (producción sirve únicamente .js).
   - Falla con código != 0 si algún archivo no existe o no transpila,
     para que el deploy se detenga en vez de subir algo roto.
   ============================================================ */
const fs = require("fs");
const path = require("path");
const babel = require("@babel/standalone");

const base = process.argv[2];
if (!base) {
  console.error("Falta el directorio base. Uso: node tools/precompile.js <directorioBase>");
  process.exit(1);
}

// Archivos JSX cargados como type="text/babel" en index.html y admin/Admin.html.
// El orden no importa aquí (cada uno se transpila por separado).
const files = [
  "tweaks-panel.jsx",
  "components/Icons.jsx",
  "components/Top.jsx",
  "components/Bottom.jsx",
  "app.jsx",
  "admin/AdminIcons.jsx",
  "admin/Common.jsx",
  "admin/Dashboard.jsx",
  "admin/Products.jsx",
  "admin/Orders.jsx",
  "admin/Customers.jsx",
  "admin/Settings.jsx",
  "admin/AdminShell.jsx",
];

let ok = 0;
for (const rel of files) {
  const src = path.join(base, rel);
  if (!fs.existsSync(src)) {
    console.error("✗ No existe: " + rel);
    process.exit(1);
  }
  let code;
  try {
    code = babel.transform(fs.readFileSync(src, "utf8"), {
      presets: ["react"],
      filename: rel,
      compact: false,
      comments: false,
    }).code;
  } catch (e) {
    console.error("✗ Error transpilando " + rel + ": " + e.message);
    process.exit(1);
  }
  // Envolver en IIFE: con <script type="text/babel"> cada archivo corría en su
  // propio scope (Babel los evalúa por separado), así que patrones como
  //   const { Ic } = window;   y   const Ic = {...}
  // en archivos distintos NO chocaban. Como <script src> normales comparten el
  // scope global, esos `const` de nivel superior colisionarían
  // ("Identifier already declared") y romperían el render. El IIFE restaura el
  // aislamiento; los exports siguen funcionando porque van por `window`.
  const wrapped = "(function(){\n" + code + "\n})();\n";
  const dst = src.replace(/\.jsx$/, ".js");
  fs.writeFileSync(dst, wrapped);
  fs.unlinkSync(src); // quita el .jsx de la salida: prod solo sirve .js
  ok++;
  console.log("✓ " + rel + " → " + rel.replace(/\.jsx$/, ".js"));
}

console.log("Transpilados: " + ok + "/" + files.length);
