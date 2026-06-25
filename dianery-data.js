/* ============================================================
   Variedades Dianery — Capa de datos compartida
   Fuente de verdad para Admin + Tienda. Persiste en localStorage.
   El admin edita; la tienda lee (refleja al recargar / vía storage event).
   ============================================================ */
(function () {
  const KEY = "dianery_store_v1";

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
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("dianery:change"));
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

    upsertProduct(p) {
      if (p.id) {
        const i = state.products.findIndex(x => x.id === p.id);
        if (i >= 0) state.products[i] = { ...state.products[i], ...p };
        else state.products.push(p);
      } else {
        p.id = "p" + Date.now();
        state.products.push(p);
      }
      save();
      return p;
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
    onChange(fn) {
      const h = () => fn(state);
      window.addEventListener("dianery:change", h);
      window.addEventListener("storage", (e) => { if (e.key === KEY) { state = load() || state; fn(state); } });
      return h;
    }
  };

  window.DianeryData = DianeryData;
})();
