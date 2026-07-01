/* ============================================================
   Variedades Dianery — Capa de datos compartida
   Fuente de verdad para Admin + Tienda. Persiste en localStorage.
   El admin edita; la tienda lee (refleja al recargar / vía storage event).
   ============================================================ */
(function () {
  const KEY = "dianery_store_v1";
  const CART_KEY = "dianery_cart_v1";
  const DIRTY_KEY = "dianery_dirty_v1";   // hay cambios locales sin enviar al servidor
  const ADMIN_TOKEN_KEY = "dianery_admin_token_v1";
  const API_URL = "/api.php";   // backend compartido (Hostinger PHP) — datos iguales en todos los dispositivos
  const ADMIN_MODE = window.DIANERY_ADMIN_MODE === true || /\/admin\//i.test(window.location.pathname);

  const MAX_IMAGES = 5;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const ALLOWED_URL_PROTOCOLS = ["https:", "http:", "mailto:", "tel:"];

  const SEED = {
    config: {
      brandName: "Variedades Dianery",
      tagline: "Tienda de variedades",
      bannerKicker: "Colección 2026",
      bannerTitle: "TODAS LAS VARIEDADES",
      bannerImage: "",
      lowStockThreshold: 5,
      closing: {
        enabled: true,
        kicker: "Siempre algo nuevo",
        title: "Siempre hay algo nuevo para descubrir",
        highlightedText: "#VariedadesDianery"
      },
      contact: {
        title: "Línea de atención",
        phone: "01 8000 000 000",
        whatsapp: "+57 300 000 0000",
        email: "hola@variedadesdianery.com",
        schedule: "Lunes a viernes, 8:00 a.m. – 6:00 p.m."
      },
      socialLinks: [
        { name: "Instagram", href: "#", icon: "instagram" },
        { name: "Facebook", href: "#", icon: "facebook" },
        { name: "TikTok", href: "#", icon: "tiktok" },
        { name: "YouTube", href: "#", icon: "youtube" }
      ],
      chat: { enabled: true, provider: "whatsapp", label: "Habla con nosotros", href: "#" }
    },

    categories: ["Accesorios", "Cocina", "Cuidado", "Hogar", "Jardín", "Moda", "Papelería"],

    products: [
      { id: "p1", name: "Vela de Soja Lavanda", tag: "Hogar", desc: "Aroma relajante de lavanda y vainilla, 40 horas de duración.", price: 38000, stock: 24, sku: "VEL-LAV-01", active: true },
      { id: "p2", name: "Set de Tazas Artesanales", tag: "Cocina", desc: "Cerámica esmaltada a mano, juego de dos piezas.", price: 54000, stock: 12, sku: "TAZ-ART-02", active: true },
      { id: "p3", name: "Jabón Natural de Avena", tag: "Cuidado", desc: "Hidratación suave con avena y miel, sin sulfatos.", price: 16000, stock: 4, sku: "JAB-AVE-03", active: true },
      { id: "p4", name: "Cuaderno Tapa Dura Kraft", tag: "Papelería", desc: "Papel reciclado de 90g, 160 páginas punteadas.", price: 29000, stock: 38, sku: "CUA-KRA-04", active: true },
      { id: "p5", name: "Bolso de Yute Tejido", tag: "Accesorios", desc: "Fibra natural resistente, ideal para el mercado.", price: 45000, stock: 0, sku: "BOL-YUT-05", active: false },
      { id: "p6", name: "Difusor de Mimbre Cítrico", tag: "Hogar", desc: "Aroma cítrico fresco que perdura por semanas.", price: 42000, stock: 17, sku: "DIF-CIT-06", active: true },
      { id: "p7", name: "Mini Maceta de Barro", tag: "Jardín", desc: "Terracota natural con plato, para suculentas.", price: 22000, stock: 51, sku: "MAC-BAR-07", active: true },
      { id: "p8", name: "Pañuelo de Algodón Estampado", tag: "Moda", desc: "Estampado floral en algodón orgánico suave.", price: 33000, stock: 9, sku: "PAN-ALG-08", active: true },
      { id: "p9", name: "Tabla de Picar Olivo", tag: "Cocina", desc: "Madera de olivo curada, vetas únicas en cada pieza.", price: 61000, stock: 6, sku: "TAB-OLI-09", active: true }
    ],

    // Los pedidos y clientes reales viven en la base de datos (servidor).
    // El SEED arranca vacío para que NO reaparezcan registros de demo tras borrarlos.
    orders: [],

    customers: [],

    metrics: {
      visitsMonth: 4820,
      visitsDelta: 12.4,
      salesByMonth: [
        { m: "Ene", v: 2.1 }, { m: "Feb", v: 2.6 }, { m: "Mar", v: 3.0 },
        { m: "Abr", v: 2.8 }, { m: "May", v: 3.6 }, { m: "Jun", v: 4.2 }
      ]
    }
  };

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function safeUrl(v, allowHash = true) {
    const url = String(v || "").trim();
    if (allowHash && (!url || url === "#")) return "#";
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) return "#";
    try {
      const parsed = new URL(url);
      return ALLOWED_URL_PROTOCOLS.includes(parsed.protocol.toLowerCase()) ? url : "#";
    } catch (e) {
      return "#";
    }
  }

  // Acepta una imagen como archivo subido ("uploads/xxx.jpg") o, por
  // compatibilidad, como data URL base64 (productos antiguos).
  function safeImageDataUrl(v) {
    const s = String(v || "").trim();
    if (!s) return "";
    if (/^\/?uploads\/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp)$/i.test(s)) return "/" + s.replace(/^\//, "");
    return /^data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$/i.test(s) ? s : "";
  }

  function cleanImages(images) {
    if (!Array.isArray(images)) return [];
    return images.slice(0, MAX_IMAGES).map(safeImageDataUrl).filter(Boolean);
  }

  function cleanSocialLinks(links) {
    if (!Array.isArray(links)) return [];
    return links.slice(0, 10).map(s => ({
      ...s,
      href: safeUrl(s && s.href)
    }));
  }

  function mergeConfig(config) {
    const base = deepClone(SEED.config);
    const c = config && typeof config === "object" ? config : {};
    const chat = { ...base.chat, ...((c.chat && typeof c.chat === "object") ? c.chat : {}) };
    const lowStock = parseInt(c.lowStockThreshold, 10);
    return {
      ...base,
      ...c,
      bannerImage: safeImageDataUrl(c.bannerImage || ""),
      lowStockThreshold: (isNaN(lowStock) || lowStock < 0) ? (base.lowStockThreshold || 5) : Math.min(lowStock, 9999),
      closing: { ...base.closing, ...((c.closing && typeof c.closing === "object") ? c.closing : {}) },
      contact: { ...base.contact, ...((c.contact && typeof c.contact === "object") ? c.contact : {}) },
      chat: { ...chat, href: safeUrl(chat.href) },
      socialLinks: cleanSocialLinks(Array.isArray(c.socialLinks) ? c.socialLinks : base.socialLinks)
    };
  }

  function cleanProduct(p) {
    return {
      ...p,
      images: cleanImages(p && p.images)
    };
  }

  function normalizeStore(data) {
    const base = deepClone(SEED);
    if (!data || typeof data !== "object") return base;
    return {
      ...base,
      ...data,
      config: mergeConfig(data.config),
      categories: Array.isArray(data.categories) ? data.categories : base.categories,
      products: Array.isArray(data.products) ? data.products.map(cleanProduct) : base.products,
      orders: Array.isArray(data.orders) ? data.orders : base.orders,
      customers: Array.isArray(data.customers) ? data.customers : base.customers,
      metrics: data.metrics && typeof data.metrics === "object" ? data.metrics : base.metrics
    };
  }

  function getAdminToken() {
    if (!ADMIN_MODE) return "";
    try {
      return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function clearStoredAdminToken(status) {
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("dianery:auth", { detail: { status: status || 401 } }));
  }

  function authHeaders(extra) {
    const headers = { ...(extra || {}) };
    const token = getAdminToken();
    if (token) headers["X-Dianery-Admin-Token"] = token;
    return headers;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  let initialized = false;       // true tras la carga inicial; recién entonces se persiste al servidor
  let userSavedLocally = false;  // el usuario editó en esta sesión → no pisar con datos del servidor en vuelo
  let dirty = false;             // hay cambios locales sin ENVIAR (modo "Guardar cambios" explícito)
  try { dirty = localStorage.getItem(DIRTY_KEY) === "1"; } catch (e) {}

  function setDirty(v) {
    dirty = v;
    try {
      if (v) localStorage.setItem(DIRTY_KEY, "1");
      else localStorage.removeItem(DIRTY_KEY);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("dianery:change")); // refresca el botón "Guardar cambios"
  }

  const storedState = load();
  let state = normalizeStore(storedState);
  if (!storedState) { save(); }
  // Migración: estados guardados antes de existir categorías → derivarlas de los productos.
  else if (!Array.isArray(state.categories)) {
    state.categories = [...new Set((state.products || []).map(p => p.tag).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es"));
    save();
  }

  function save() {
    let ok = true;
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { ok = false; } // p. ej. cuota de localStorage superada
    window.dispatchEvent(new CustomEvent("dianery:change"));
    // Modo explícito: los cambios se ACUMULAN en local y se marcan como pendientes.
    // No se envían al servidor hasta que el usuario pulsa "Guardar cambios" (commit()).
    if (initialized) { userSavedLocally = true; setDirty(true); }
    return ok;
  }

  // ---- Sincronización con el servidor (datos compartidos entre dispositivos) ----
  // Envía el store completo al servidor. Devuelve Promise<boolean> (true = guardado).
  function postStore() {
    if (ADMIN_MODE && !getAdminToken()) {
      if (window.adminToast) window.adminToast("Ingresa el token de administrador para guardar.");
      return Promise.resolve(false);
    }
    try {
      return fetch(API_URL, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(state)
      })
        .then(function (r) {
          if (r.status === 401) {
            clearStoredAdminToken(401);
            if (window.adminToast) window.adminToast("Token de administrador inválido. Ingrésalo de nuevo.");
            return false;
          }
          if (r.status === 503) {
            if (window.adminToast) window.adminToast("Base de datos no disponible. Intenta de nuevo.");
            return false; // se conserva 'dirty' para reintentar
          }
          if (!r.ok) {
            if (window.adminToast) window.adminToast("No se pudo guardar en el servidor.");
            return false;
          }
          return true;
        })
        .catch(function () {
          if (window.adminToast) window.adminToast("Sin conexión: no se pudo guardar.");
          return false;
        });
    } catch (e) { return Promise.resolve(false); }
  }
  function syncFromServer() {
    try {
      fetch(API_URL + "?t=" + Date.now(), { cache: "no-store", headers: authHeaders() })
        .then(function (r) {
          if (r.status === 401) { clearStoredAdminToken(401); return null; }
          return r.status === 200 ? r.json() : null; // 503/otros: conserva el cache local
        })
        .then(function (data) {
          if (userSavedLocally || dirty) return; // cambios locales sin guardar → no sobrescribir
          if (data && Array.isArray(data.products) && data.config) {
            state = normalizeStore(data);
            try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
            window.dispatchEvent(new CustomEvent("dianery:change"));
          }
        })
        .catch(function () {}); // sin red/sin servidor: se queda con el cache local
    } catch (e) {} // fetch no disponible → se queda con el cache local
  }

  // ---- Carrito (clave aparte, solo tienda) ----
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
  }
  let cart = loadCart();
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("dianery:cart"));
  }

  // ---- Validación de producto ----
  function isNum(v) { return v !== "" && v !== null && v !== undefined && !isNaN(Number(v)); }
  function validateProduct(p) {
    const errors = [];
    if (!p.name || !String(p.name).trim()) errors.push("El nombre es obligatorio.");
    if (!p.tag || !String(p.tag).trim()) errors.push("La categoría es obligatoria.");
    if (!p.sku || !String(p.sku).trim()) errors.push("El SKU es obligatorio.");
    if (!isNum(p.price)) errors.push("El precio es obligatorio y debe ser numérico.");
    else if (Number(p.price) < 0) errors.push("El precio no puede ser negativo.");
    if (!isNum(p.stock)) errors.push("El stock es obligatorio y debe ser numérico.");
    else if (Number(p.stock) < 0) errors.push("El stock no puede ser negativo.");
    if (typeof p.active !== "boolean") errors.push("El estado debe ser activo o inactivo.");
    if ((p.images || []).length > MAX_IMAGES) errors.push("Máximo " + MAX_IMAGES + " imágenes por producto.");
    return errors;
  }

  // ---- API ----
  const DianeryData = {
    get: () => state,
    getConfig: () => state.config,
    getProducts: () => state.products,
    getOrders: () => state.orders,
    getCustomers: () => state.customers,
    getMetrics: () => state.metrics,
    getVisits: () => state.visits || { month: 0, prev: 0, total: 0 }, // conteo real (servidor)

    // Sube una imagen (data URL) al servidor y devuelve su ruta ("uploads/xxx").
    // Las imágenes se guardan como ARCHIVOS, no como base64 en el store (evita
    // llenar el localStorage y aligera los guardados/POST).
    uploadImage(dataUrl) {
      if (ADMIN_MODE && !getAdminToken()) {
        return Promise.reject(new Error("Ingresa el token de administrador."));
      }
      return fetch("/upload.php", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ image: dataUrl })
      }).then(function (r) {
        if (r.status === 401) { clearStoredAdminToken(401); throw new Error("Token de administrador inválido."); }
        return r.json();
      }).then(function (j) {
        if (!j || !j.ok || !j.url) throw new Error((j && j.error) || "No se pudo subir la imagen.");
        return j.url;
      });
    },

    // ---- Admin Inteligente AI (asistente de borradores de producto) ----
    aiFetch(action, body) {
      if (ADMIN_MODE && !getAdminToken()) {
        return Promise.reject(new Error("Ingresa el token de administrador."));
      }
      const opts = { cache: "no-store", headers: authHeaders(body ? { "Content-Type": "application/json" } : {}) };
      if (body) { opts.method = "POST"; opts.body = JSON.stringify(body); }
      return fetch("/ai.php?action=" + encodeURIComponent(action), opts).then(function (r) {
        if (r.status === 401) { clearStoredAdminToken(401); throw new Error("Token de administrador inválido."); }
        return r.json().catch(function () { throw new Error("Respuesta ilegible del servidor."); }).then(function (j) {
          if (!j || j.ok === false) throw new Error((j && j.error) || "Error del asistente de IA.");
          return j;
        });
      });
    },
    aiModels() { return this.aiFetch("models"); },
    aiAnalyze(payload) { return this.aiFetch("analyze", payload); },
    aiRefine(payload) { return this.aiFetch("refine", payload); },
    aiCreateDraft(payload) { return this.aiFetch("create-draft", payload); },
    aiLogs() { return this.aiFetch("logs"); },

    // Inserta en el estado local un producto que YA está guardado en el servidor
    // (borrador creado por la IA). No marca "cambios sin guardar": así un commit
    // posterior lo conserva y no hay nada pendiente de enviar.
    addLocalProduct(p) {
      if (!p || !p.id) return;
      if (state.products.some(function (x) { return x.id === p.id; })) return;
      state.products.push(p);
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      window.dispatchEvent(new CustomEvent("dianery:change"));
    },

    // ---- Guardado explícito ("Guardar cambios") ----
    hasPendingChanges: () => dirty,
    // Envía al servidor los cambios acumulados. Devuelve Promise<boolean>.
    commit() {
      if (!dirty) return Promise.resolve(true);
      return postStore().then(function (ok) {
        if (ok) {
          setDirty(false);
          if (window.adminToast) window.adminToast("Cambios guardados");
        }
        return ok;
      });
    },

    isAdminMode: () => ADMIN_MODE,
    hasAdminToken: () => !!getAdminToken(),
    setAdminToken(token, remember) {
      const clean = String(token || "").trim();
      try {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        if (clean) {
          (remember ? localStorage : sessionStorage).setItem(ADMIN_TOKEN_KEY, clean);
        }
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("dianery:auth", { detail: { status: clean ? 200 : 401 } }));
      if (clean) syncFromServer();
    },
    clearAdminToken() {
      clearStoredAdminToken(401);
    },
    verifyAdminToken(token) {
      const clean = String(token || "").trim();
      if (!clean) return Promise.resolve(false);
      return fetch(API_URL + "?t=" + Date.now(), {
        cache: "no-store",
        headers: { "X-Dianery-Admin-Token": clean }
      }).then(function (r) {
        return r.status === 200;
      }).catch(function () {
        return false;
      });
    },

    saveConfig(patch) { state.config = mergeConfig({ ...state.config, ...patch }); save(); },

    MAX_IMAGES,
    ALLOWED_IMAGE_TYPES,
    safeUrl,
    validateProduct,

    // Tienda (onlyActive=true): categorías con ≥1 producto activo.
    // Admin (sin arg): lista gestionada ∪ categorías presentes en productos (compatibilidad).
    getCategories(onlyActive) {
      if (onlyActive) {
        const tags = state.products.filter(p => p.active).map(p => p.tag).filter(Boolean);
        return [...new Set(tags)].sort((a, b) => a.localeCompare(b, "es"));
      }
      const managed = state.categories || [];
      const fromProducts = state.products.map(p => p.tag).filter(Boolean);
      return [...new Set([...managed, ...fromProducts])].sort((a, b) => a.localeCompare(b, "es"));
    },

    // Cuántos productos usan una categoría (para mostrar uso y bloquear borrado).
    countProductsInCategory(name) {
      return state.products.filter(p => p.tag === name).length;
    },
    // Crear categoría. Devuelve { ok, error }.
    addCategory(name) {
      const n = String(name || "").trim();
      if (!n) return { ok: false, error: "Escribe un nombre para la categoría." };
      if ((state.categories || []).some(c => c.toLowerCase() === n.toLowerCase()))
        return { ok: false, error: "Esa categoría ya existe." };
      state.categories = [...(state.categories || []), n];
      save();
      return { ok: true };
    },
    // Eliminar categoría. Se bloquea si hay productos que la usan. Devuelve { ok, error }.
    deleteCategory(name) {
      const inUse = this.countProductsInCategory(name);
      if (inUse > 0) return { ok: false, error: `No puedes eliminar "${name}": ${inUse} producto(s) la usan. Reasígnalos primero.` };
      state.categories = (state.categories || []).filter(c => c !== name);
      save();
      return { ok: true };
    },

    // Devuelve { ok, errors, product }. No persiste si la validación falla.
    upsertProduct(p) {
      const errors = validateProduct(p);
      if (errors.length) return { ok: false, errors, product: null };
      const clean = {
        ...p,
        name: String(p.name).trim(),
        tag: String(p.tag).trim(),
        sku: String(p.sku).trim(),
        desc: String(p.desc || "").trim(),
        price: Number(p.price),
        stock: Number(p.stock),
        active: !!p.active,
        images: cleanImages(p.images)
      };
      if (clean.id) {
        const i = state.products.findIndex(x => x.id === clean.id);
        if (i >= 0) state.products[i] = { ...state.products[i], ...clean };
        else state.products.push(clean);
      } else {
        clean.id = "p" + Date.now();
        state.products.push(clean);
      }
      const saved = save();
      return { ok: saved, errors: saved ? [] : ["No se pudo guardar: almacenamiento del navegador lleno. Reduce el tamaño o número de imágenes."], product: clean };
    },
    deleteProduct(id) { state.products = state.products.filter(p => p.id !== id); save(); },

    // ---- Clientes: crear / editar / eliminar ----
    validateCustomer(c) {
      const e = [];
      if (!c || !String(c.name || "").trim()) e.push("El nombre es obligatorio.");
      if (!/^\S+@\S+\.\S+$/.test(String((c && c.email) || "").trim())) e.push("Escribe un email válido.");
      return e;
    },
    // Devuelve { ok, errors, customer }. No persiste si la validación falla.
    upsertCustomer(c) {
      const errors = this.validateCustomer(c);
      if (errors.length) return { ok: false, errors, customer: null };
      const clean = {
        ...c,
        name: String(c.name).trim(),
        email: String(c.email).trim(),
        city: String(c.city || "").trim(),
        orders: Number(c.orders) || 0,
        spent: Number(c.spent) || 0,
        since: c.since || new Date().toISOString().slice(0, 10)
      };
      if (clean.id) {
        const i = state.customers.findIndex(x => x.id === clean.id);
        if (i >= 0) state.customers[i] = { ...state.customers[i], ...clean };
        else state.customers.push(clean);
      } else {
        clean.id = "c" + Date.now();
        state.customers.push(clean);
      }
      save();
      return { ok: true, errors: [], customer: clean };
    },
    deleteCustomer(id) { state.customers = state.customers.filter(c => c.id !== id); save(); },

    setOrderStatus(id, status) {
      const o = state.orders.find(x => x.id === id);
      if (o) { o.status = status; save(); }
    },

    deleteOrder(id) { state.orders = state.orders.filter(o => o.id !== id); save(); },

    reset() { state = deepClone(SEED); save(); },

    formatCOP(n) {
      return "$" + Number(n || 0).toLocaleString("es-CO");
    },

    // ---- Exportar a CSV (respaldo desde el admin) ----
    // columns: [{ label, key }] o [{ label, get: (row) => valor }]
    csvFromRows(rows, columns) {
      const esc = (v) => {
        const s = (v === null || v === undefined) ? "" : String(v);
        return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const head = columns.map(c => esc(c.label)).join(",");
      const body = (rows || []).map(r =>
        columns.map(c => esc(c.get ? c.get(r) : r[c.key])).join(",")
      ).join("\r\n");
      return head + "\r\n" + body;
    },
    downloadBlob(filename, parts, mime) {
      const blob = new Blob(parts, { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    },
    downloadCSV(filename, csv) {
      // El BOM (﻿) hace que Excel reconozca UTF-8 (tildes, ñ).
      this.downloadBlob(filename, ["﻿" + csv], "text/csv;charset=utf-8;");
    },
    // Respaldo COMPLETO de la base de datos (todo el store, en JSON restaurable).
    exportFullBackup() {
      const json = JSON.stringify(this.get(), null, 2);
      const stamp = new Date().toISOString().slice(0, 10);
      this.downloadBlob("variedades-dianery-respaldo-" + stamp + ".json", [json], "application/json;charset=utf-8;");
    },
    exportProductsCSV() {
      const cols = [
        { label: "ID", key: "id" },
        { label: "Nombre", key: "name" },
        { label: "Categoría", key: "tag" },
        { label: "SKU", key: "sku" },
        { label: "Precio", key: "price" },
        { label: "Stock", key: "stock" },
        { label: "Activo", get: p => p.active ? "Sí" : "No" },
        { label: "Descripción", key: "desc" },
        { label: "Nº imágenes", get: p => (p.images || []).length },
      ];
      const stamp = new Date().toISOString().slice(0, 10);
      this.downloadCSV("productos-" + stamp + ".csv", this.csvFromRows(this.getProducts(), cols));
    },
    exportCustomersCSV() {
      const cols = [
        { label: "ID", key: "id" },
        { label: "Nombre", key: "name" },
        { label: "Email", key: "email" },
        { label: "Ciudad", key: "city" },
        { label: "Pedidos", key: "orders" },
        { label: "Gastado", key: "spent" },
        { label: "Cliente desde", key: "since" },
      ];
      const stamp = new Date().toISOString().slice(0, 10);
      this.downloadCSV("clientes-" + stamp + ".csv", this.csvFromRows(this.getCustomers(), cols));
    },
    exportOrdersCSV() {
      const cols = [
        { label: "ID", key: "id" },
        { label: "Cliente", key: "customer" },
        { label: "Ciudad", key: "city" },
        { label: "Fecha", key: "date" },
        { label: "Items", key: "items" },
        { label: "Total", key: "total" },
        { label: "Estado", key: "status" },
      ];
      const stamp = new Date().toISOString().slice(0, 10);
      this.downloadCSV("pedidos-" + stamp + ".csv", this.csvFromRows(this.getOrders(), cols));
    },

    // ---- Carrito ----
    getCart() { return cart; },
    // Devuelve líneas con datos del producto resueltos (omite productos borrados/inactivos)
    getCartDetailed() {
      return cart.map(line => {
        const p = state.products.find(x => x.id === line.id);
        return p ? { ...line, product: p } : null;
      }).filter(Boolean);
    },
    cartCount() { return cart.reduce((n, l) => n + l.qty, 0); },
    cartTotal() {
      return cart.reduce((sum, l) => {
        const p = state.products.find(x => x.id === l.id);
        return sum + (p ? p.price * l.qty : 0);
      }, 0);
    },
    // Devuelve false si no hay stock disponible para agregar
    addToCart(id, qty = 1) {
      const p = state.products.find(x => x.id === id);
      if (!p || !p.active) return false;
      const max = Math.max(0, p.stock);
      const line = cart.find(l => l.id === id);
      const current = line ? line.qty : 0;
      const room = max - current;
      if (room <= 0) return false;             // ya alcanzó el stock
      const add = Math.min(qty, room);
      if (line) line.qty = current + add;
      else cart.push({ id, qty: add });
      saveCart();
      return true;
    },
    setCartQty(id, qty) {
      const line = cart.find(l => l.id === id);
      if (!line) return;
      if (qty <= 0) cart = cart.filter(l => l.id !== id);
      else line.qty = qty;
      saveCart();
    },
    removeFromCart(id) { cart = cart.filter(l => l.id !== id); saveCart(); },
    clearCart() { cart = []; saveCart(); },

    // ---- WhatsApp (número configurable desde Admin → Contacto) ----
    getWhatsappNumber() {
      const raw = (state.config.contact && state.config.contact.whatsapp) || "";
      return raw.replace(/\D/g, "");
    },
    buildOrderMessage() {
      const brand = state.config.brandName || "la tienda";
      const lines = this.getCartDetailed();
      let msg = `Hola, quiero hacer este pedido en ${brand}:\n\n`;
      lines.forEach((l, i) => {
        const sub = l.product.price * l.qty;
        msg += `${i + 1}. ${l.product.name}\n`;
        msg += `Cantidad: ${l.qty}\n`;
        msg += `Precio unitario: ${this.formatCOP(l.product.price)}\n`;
        msg += `Subtotal: ${this.formatCOP(sub)}\n\n`;
      });
      msg += `Total: ${this.formatCOP(this.cartTotal())}\n\n`;
      msg += "Quedo atento/a para confirmar disponibilidad, entrega y forma de pago.";
      return msg;
    },
    whatsappOrderUrl() {
      return `https://wa.me/${this.getWhatsappNumber()}?text=${encodeURIComponent(this.buildOrderMessage())}`;
    },
    whatsappProductUrl(p) {
      const brand = state.config.brandName || "la tienda";
      const msg = `Hola, quiero consultar por este producto de ${brand}:\n\n` +
        `${p.name} (SKU ${p.sku})\nPrecio: ${this.formatCOP(p.price)}\n` +
        `${this.productShareUrl(p)}\n\n¿Está disponible?`;
      return `https://wa.me/${this.getWhatsappNumber()}?text=${encodeURIComponent(msg)}`;
    },
    // URL pública y compartible de un producto (?p=<sku> → el servidor genera el preview).
    productShareUrl(p) {
      const base = (typeof window !== "undefined" && window.location)
        ? window.location.origin + window.location.pathname : "";
      return base + "?p=" + encodeURIComponent(p.sku);
    },
    onCartChange(fn) {
      const h = () => fn(cart);
      window.addEventListener("dianery:cart", h);
      window.addEventListener("storage", (e) => { if (e.key === CART_KEY) { cart = loadCart(); fn(cart); } });
      return h;
    },

    onChange(fn) {
      const h = () => fn(state);
      window.addEventListener("dianery:change", h);
      window.addEventListener("storage", (e) => { if (e.key === KEY) { state = normalizeStore(load() || state); fn(state); } });
      return h;
    }
  };

  // Sincronización entre pestañas: si el Admin guarda en otra pestaña, la Tienda
  // recarga el estado desde localStorage y dispara el evento para re-renderizar.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      const s = load();
      if (s) { state = normalizeStore(s); window.dispatchEvent(new CustomEvent("dianery:change")); }
    } else if (e.key === CART_KEY) {
      cart = loadCart();
      window.dispatchEvent(new CustomEvent("dianery:cart"));
    }
  });

  window.DianeryData = DianeryData;

  // Aviso al salir del admin si hay cambios sin guardar (modo explícito).
  if (ADMIN_MODE) {
    window.addEventListener("beforeunload", function (e) {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    });
  }

  // Contador de visitas: una vez por sesión del navegador y SOLO en la tienda
  // (no en el admin). Sin cookies ni datos personales; el servidor cuenta por día.
  if (!ADMIN_MODE) {
    try {
      if (!sessionStorage.getItem("dianery_hit_v1")) {
        sessionStorage.setItem("dianery_hit_v1", "1");
        fetch("/hit.php", { method: "POST", keepalive: true, cache: "no-store" }).catch(function () {});
      }
    } catch (e) {}
  }

  // Carga inicial desde el servidor (datos compartidos). A partir de aquí, cada
  // edición marca "cambios sin guardar"; se envían al pulsar "Guardar cambios".
  initialized = true;
  syncFromServer();
})();
