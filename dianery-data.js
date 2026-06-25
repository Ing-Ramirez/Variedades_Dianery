/* ============================================================
   Variedades Dianery — Capa de datos compartida
   Fuente de verdad para Admin + Tienda. Persiste en localStorage.
   El admin edita; la tienda lee (refleja al recargar / vía storage event).
   ============================================================ */
(function () {
  const KEY = "dianery_store_v1";
  const CART_KEY = "dianery_cart_v1";

  const MAX_IMAGES = 5;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const SEED = {
    config: {
      brandName: "Variedades Dianery",
      tagline: "Tienda de variedades",
      bannerKicker: "Colección 2026",
      bannerTitle: "TODAS LAS VARIEDADES",
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

    orders: [
      { id: "1042", customer: "Laura Restrepo", city: "Medellín", date: "2026-06-22", items: 3, total: 108000, status: "Nuevo" },
      { id: "1041", customer: "Carlos Mejía", city: "Bogotá", date: "2026-06-22", items: 1, total: 61000, status: "Preparando" },
      { id: "1040", customer: "Daniela Ortiz", city: "Cali", date: "2026-06-21", items: 2, total: 70000, status: "Preparando" },
      { id: "1039", customer: "Andrés Gómez", city: "Barranquilla", date: "2026-06-21", items: 5, total: 184000, status: "Enviado" },
      { id: "1038", customer: "Valentina Cruz", city: "Bucaramanga", date: "2026-06-20", items: 1, total: 38000, status: "Enviado" },
      { id: "1037", customer: "Sebastián Rúa", city: "Medellín", date: "2026-06-20", items: 2, total: 75000, status: "Entregado" },
      { id: "1036", customer: "María Páez", city: "Pereira", date: "2026-06-19", items: 4, total: 142000, status: "Entregado" },
      { id: "1035", customer: "Juan David León", city: "Bogotá", date: "2026-06-19", items: 1, total: 22000, status: "Cancelado" },
      { id: "1034", customer: "Camila Soto", city: "Manizales", date: "2026-06-18", items: 3, total: 96000, status: "Entregado" }
    ],

    customers: [
      { id: "c1", name: "Laura Restrepo", email: "laura.r@correo.com", city: "Medellín", orders: 7, spent: 612000, since: "2025-02-14" },
      { id: "c2", name: "Carlos Mejía", email: "cmejia@correo.com", city: "Bogotá", orders: 4, spent: 248000, since: "2025-05-03" },
      { id: "c3", name: "Daniela Ortiz", email: "dani.ortiz@correo.com", city: "Cali", orders: 9, spent: 731000, since: "2024-11-20" },
      { id: "c4", name: "Andrés Gómez", email: "agomez@correo.com", city: "Barranquilla", orders: 2, spent: 222000, since: "2026-01-08" },
      { id: "c5", name: "Valentina Cruz", email: "valen.cruz@correo.com", city: "Bucaramanga", orders: 5, spent: 305000, since: "2025-08-17" },
      { id: "c6", name: "María Páez", email: "mariapaez@correo.com", city: "Pereira", orders: 3, spent: 198000, since: "2025-12-02" }
    ],

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

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  let state = load();
  if (!state) { state = deepClone(SEED); save(); }

  function save() {
    let ok = true;
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { ok = false; } // p. ej. cuota de localStorage superada
    window.dispatchEvent(new CustomEvent("dianery:change"));
    return ok;
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

    saveConfig(patch) { state.config = { ...state.config, ...patch }; save(); },

    MAX_IMAGES,
    ALLOWED_IMAGE_TYPES,
    validateProduct,

    // Categorías presentes en el catálogo (opcionalmente solo activos)
    getCategories(onlyActive) {
      const src = onlyActive ? state.products.filter(p => p.active) : state.products;
      return [...new Set(src.map(p => p.tag).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
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
        images: (p.images || []).slice(0, MAX_IMAGES)
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

    setOrderStatus(id, status) {
      const o = state.orders.find(x => x.id === id);
      if (o) { o.status = status; save(); }
    },

    reset() { state = deepClone(SEED); save(); },

    formatCOP(n) {
      return "$" + Number(n || 0).toLocaleString("es-CO");
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
        `${p.name} (SKU ${p.sku})\nPrecio: ${this.formatCOP(p.price)}\n\n¿Está disponible?`;
      return `https://wa.me/${this.getWhatsappNumber()}?text=${encodeURIComponent(msg)}`;
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
      window.addEventListener("storage", (e) => { if (e.key === KEY) { state = load() || state; fn(state); } });
      return h;
    }
  };

  window.DianeryData = DianeryData;
})();
