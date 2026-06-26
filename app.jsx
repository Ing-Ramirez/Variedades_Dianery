/* App — ensambla la página desde siteConfig + Tweaks */
const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle, TweakSlider } = window;
const { Header, Banner, Catalog, ClosingCampaign, Footer, FloatingChat, ProductDetail, CartDrawer, ShopToast } = window;

/* Re-renderiza cuando cambian datos o carrito (admin escribe, tienda refleja) */
function useStoreData() {
  const [, setRev] = React.useState(0);
  React.useEffect(() => {
    const h = () => setRev(r => r + 1);
    window.addEventListener("dianery:change", h);
    window.addEventListener("dianery:cart", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("dianery:change", h);
      window.removeEventListener("dianery:cart", h);
      window.removeEventListener("storage", h);
    };
  }, []);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#a8775a",
  "footerTheme": "espresso",
  "showClosing": true,
  "showChat": true,
  "radius": 14
}/*EDITMODE-END*/;

const FOOTER_THEMES = {
  espresso: { bg: "#2a2620", bg2: "#211e18", label: "Espresso" },
  verde:    { bg: "#243331", bg2: "#1b2725", label: "Verde" },
  carbon:   { bg: "#262524", bg2: "#1a1918", label: "Carbón" }
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const cfg = window.siteConfig;
  const D = window.DianeryData;
  const dc = D.getConfig() || {};   // config editable desde el Admin (fuente de verdad)
  const ft = FOOTER_THEMES[t.footerTheme] || FOOTER_THEMES.espresso;

  useStoreData();
  const [query, setQuery] = React.useState("");
  const [detail, setDetail] = React.useState(null);
  const [cartOpen, setCartOpen] = React.useState(false);

  const addToCart = (p) => {
    if (D.addToCart(p.id, 1)) window.shopToast && window.shopToast(`"${p.name}" agregado al carrito`);
    else window.shopToast && window.shopToast("No hay stock suficiente");
  };

  /* ---- Rutas en la tienda: ?p=<sku> abre el producto (link compartible que el
         servidor SÍ ve → permite preview por producto en WhatsApp/Facebook). ---- */
  const openDetail = (p) => {
    if (!p || !p.sku) return;
    history.pushState({ p: p.sku }, "", window.location.pathname + "?p=" + encodeURIComponent(p.sku));
    setDetail(p);
  };
  const closeDetail = () => {
    setDetail(null);
    if (new URLSearchParams(window.location.search).get("p"))
      history.pushState({}, "", window.location.pathname);
  };
  React.useEffect(() => {
    const applyUrl = () => {
      const sku = new URLSearchParams(window.location.search).get("p");
      if (sku) {
        const p = D.getProducts().find(x => x.active && String(x.sku) === sku);
        setDetail(p || null);
      } else {
        setDetail(null);
      }
    };
    applyUrl();                                       // deep-link al cargar
    window.addEventListener("popstate", applyUrl);    // atrás/adelante
    window.addEventListener("dianery:change", applyUrl); // reintenta cuando llegan datos del servidor
    return () => {
      window.removeEventListener("popstate", applyUrl);
      window.removeEventListener("dianery:change", applyUrl);
    };
  }, []);

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", t.accent);
    r.setProperty("--accent-deep", shade(t.accent, -0.16));
    r.setProperty("--footer-bg", ft.bg);
    r.setProperty("--footer-bg-2", ft.bg2);
    r.setProperty("--radius", t.radius + "px");
  }, [t.accent, t.footerTheme, t.radius]);

  /* ---- Adaptadores: lo que se administra sale de DianeryData; siteConfig solo
         aporta lo estático aún no administrable (nav, columnas/legal, imagen banner). ---- */
  const dClosing = dc.closing || cfg.closingCampaign;
  const dChat = dc.chat || cfg.floatingChat;
  const brand = { ...cfg.brand, name: dc.brandName || cfg.brand.name, tagline: dc.tagline || cfg.brand.tagline };
  const banner = { ...cfg.catalog, bannerKicker: dc.bannerKicker || cfg.catalog.bannerKicker, bannerTitle: dc.bannerTitle || cfg.catalog.bannerTitle, bannerImage: dc.bannerImage || "" };
  const closing = { ...dClosing, enabled: t.showClosing && !!dClosing.enabled };
  const footer = { ...cfg.footer, contact: dc.contact || cfg.footer.contact, socialLinks: dc.socialLinks || cfg.footer.socialLinks };
  const chat = { ...cfg.floatingChat, ...dChat, enabled: t.showChat && !!dChat.enabled };

  return (
    <React.Fragment>
      <Header brand={brand} query={query} onQuery={setQuery}
        cartCount={D.cartCount()} onCartClick={() => setCartOpen(true)} />
      <Banner catalog={banner} />
      <Catalog query={query} onOpenDetail={openDetail} onAddToCart={addToCart} />
      <ClosingCampaign data={closing} />
      <Footer data={footer} brand={brand} />
      <FloatingChat data={chat} />

      <ProductDetail product={detail} onClose={closeDetail} onAddToCart={addToCart} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ShopToast />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Marca" />
        <TweakColor label="Color de acento" value={t.accent}
          options={["#a8775a", "#b08d3e", "#9c6b52", "#7d8a5c", "#9a6b6b"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSlider label="Esquinas" value={t.radius} min={0} max={28} step={2} unit="px"
          onChange={(v) => setTweak("radius", v)} />

        <TweakSection label="Footer" />
        <TweakRadio label="Tono del footer" value={t.footerTheme}
          options={["espresso", "verde", "carbon"]}
          onChange={(v) => setTweak("footerTheme", v)} />

        <TweakSection label="Secciones" />
        <TweakToggle label="Bloque de cierre" value={t.showClosing}
          onChange={(v) => setTweak("showClosing", v)} />
        <TweakToggle label="Chat flotante" value={t.showChat}
          onChange={(v) => setTweak("showChat", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

/* Oscurece un hex un porcentaje dado */
function shade(hex, pct) {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r * (1 + pct))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 + pct))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 + pct))));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
