/* App — ensambla la página desde siteConfig + Tweaks */
const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle, TweakSlider } = window;
const { Header, Banner, Catalog, ClosingCampaign, Footer, FloatingChat } = window;

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
  const ft = FOOTER_THEMES[t.footerTheme] || FOOTER_THEMES.espresso;

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", t.accent);
    r.setProperty("--accent-deep", shade(t.accent, -0.16));
    r.setProperty("--footer-bg", ft.bg);
    r.setProperty("--footer-bg-2", ft.bg2);
    r.setProperty("--radius", t.radius + "px");
  }, [t.accent, t.footerTheme, t.radius]);

  const closing = { ...cfg.closingCampaign, enabled: t.showClosing && cfg.closingCampaign.enabled };
  const chat = { ...cfg.floatingChat, enabled: t.showChat && cfg.floatingChat.enabled };

  return (
    <React.Fragment>
      <Header brand={cfg.brand} />
      <Banner catalog={cfg.catalog} />
      <Catalog catalog={cfg.catalog} />
      <ClosingCampaign data={closing} />
      <Footer data={cfg.footer} brand={cfg.brand} />
      <FloatingChat data={chat} />

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
