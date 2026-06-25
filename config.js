/* ============================================================
   Variedades Dianery — Configuración central del sitio
   Todos los textos editables viven aquí (no se queman en el código).
   ============================================================ */
window.siteConfig = {
  brand: {
    name: "Variedades Dianery",
    tagline: "Tienda de variedades",
    nav: [
      { label: "Inicio", href: "#" },
      { label: "Productos", href: "#", current: true, hasMenu: true },
      { label: "Nuestra historia", href: "#" }
    ],
    searchPlaceholder: "Buscar"
  },

  catalog: {
    bannerTitle: "TODAS LAS VARIEDADES",
    bannerKicker: "Colección 2026",
    breadcrumb: ["Inicio", "Productos", "Categoría", "Hogar y Detalles"],
    filters: ["Categoría", "Colecciones", "Precio"],
    sortLabel: "Ordenar",
    countLabel: "12 productos",
    products: [
      { name: "Vela de Soja Lavanda", desc: "Aroma relajante de lavanda y vainilla, 40 horas de duración.", tag: "Hogar", price: "$38.000" },
      { name: "Set de Tazas Artesanales", desc: "Cerámica esmaltada a mano, juego de dos piezas.", tag: "Cocina", price: "$54.000" },
      { name: "Jabón Natural de Avena", desc: "Hidratación suave con avena y miel, sin sulfatos.", tag: "Cuidado", price: "$16.000" },
      { name: "Cuaderno Tapa Dura Kraft", desc: "Papel reciclado de 90g, 160 páginas punteadas.", tag: "Papelería", price: "$29.000" },
      { name: "Bolso de Yute Tejido", desc: "Fibra natural resistente, ideal para el mercado.", tag: "Accesorios", price: "$45.000" },
      { name: "Difusor de Mimbre Cítrico", desc: "Aroma cítrico fresco que perdura por semanas.", tag: "Hogar", price: "$42.000" },
      { name: "Mini Maceta de Barro", desc: "Terracota natural con plato, para suculentas.", tag: "Jardín", price: "$22.000" },
      { name: "Pañuelo de Algodón Estampado", desc: "Estampado floral en algodón orgánico suave.", tag: "Moda", price: "$33.000" },
      { name: "Tabla de Picar Olivo", desc: "Madera de olivo curada, vetas únicas en cada pieza.", tag: "Cocina", price: "$61.000" }
    ]
  },

  closingCampaign: {
    enabled: true,
    kicker: "Siempre algo nuevo",
    title: "Siempre hay algo nuevo para descubrir",
    highlightedText: "#VariedadesDianery"
  },

  footer: {
    // Columnas de enlaces ocultas (eran placeholders sin página real).
    // Para mostrarlas de nuevo, agrega objetos { title, links: [{ label, href }] }.
    columns: [],

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

    legal: {
      companyName: "Variedades Dianery S.A.S.",
      taxId: "NIT 901.000.000-0",
      year: "2026",
      // Enlaces legales ocultos (eran placeholders sin página real).
      links: []
    }
  },

  floatingChat: {
    enabled: true,
    provider: "whatsapp",
    label: "Habla con nosotros",
    href: "#"
  }
};
