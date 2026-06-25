/* Cierre de campaña + Footer + Chat flotante */
const { Ic: I2 } = window;

function ClosingCampaign({ data }) {
  if (!data || !data.enabled) return null;
  return (
    <section className="closing">
      <span className="kicker">{data.kicker}</span>
      <h2>{data.title}</h2>
      {data.highlightedText && <div className="hashtag">{data.highlightedText}</div>}
      <div className="rule" />
    </section>
  );
}

function ContactItem({ icon, label, value }) {
  if (!value) return null;
  const Icon = I2[icon];
  return (
    <span className="contact-item">
      {Icon && <Icon />}
      <span>
        <span className="lbl">{label}</span>
        <span className="val">{value}</span>
      </span>
    </span>
  );
}

function Footer({ data, brand }) {
  const c = data.contact || {};
  const legal = data.legal || {};
  const socials = (data.socialLinks || []).filter(s => I2[s.icon]);
  return (
    <footer className="site-footer">
      <div className="wrap">
        {/* Columnas de enlaces */}
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-name">{brand.name}</div>
            <div className="logo-sub">{brand.tagline}</div>
            <p>Detalles seleccionados a mano para tu hogar, tu mesa y tu día a día.</p>
          </div>
          {data.columns.map((col, i) => (
            <div className="footer-col" key={i}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l, j) => (
                  <li key={j}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contacto + redes */}
        <div className="footer-mid">
          <div className="contact-block">
            <h4>{c.title || "Contacto"}</h4>
            <div className="contact-list">
              <ContactItem icon="phone" label="Teléfono" value={c.phone} />
              <ContactItem icon="whatsapp" label="WhatsApp" value={c.whatsapp} />
              <ContactItem icon="mail" label="Email" value={c.email} />
              <ContactItem icon="clock" label="Horario" value={c.schedule} />
            </div>
          </div>
          {socials.length > 0 && (
            <div className="social-block">
              <h4 style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em" }}>Síguenos</h4>
              <div className="social-row">
                {socials.map((s, i) => {
                  const Icon = I2[s.icon];
                  return <a key={i} className="social-btn" href={s.href} aria-label={s.name}><Icon /></a>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Barra legal */}
        <div className="footer-legal">
          <div className="legal-links">
            {(legal.links || []).map((l, i) => <a key={i} href={l.href}>{l.label}</a>)}
          </div>
          <div className="legal-meta">
            © {legal.year} <strong>{legal.companyName}</strong>
            {legal.taxId ? <span> · {legal.taxId}</span> : null}
            <span> · Todos los derechos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FloatingChat({ data }) {
  if (!data || !data.enabled) return null;
  const Icon = data.provider === "whatsapp" ? I2.whatsapp : I2.chat;
  return (
    <a className="float-chat" href={data.href} aria-label={data.label}>
      <span className="fc-icon"><Icon /></span>
      <span className="fc-label">{data.label}</span>
    </a>
  );
}

Object.assign(window, { ClosingCampaign, Footer, FloatingChat });
