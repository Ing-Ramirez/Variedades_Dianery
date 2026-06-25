/* Cierre de campaña + Footer + Chat flotante + Carrito */
const { Ic: I2 } = window;
const DD = window.DianeryData;

/* Carrito lateral */
function CartDrawer({ open, onClose }) {
  if (!open) return null;
  const lines = DD.getCartDetailed();
  const total = DD.cartTotal();

  const checkout = () => {
    if (!lines.length) return;
    if (!DD.getWhatsappNumber()) {
      window.shopToast && window.shopToast("Configura un WhatsApp en Admin → Contacto");
      return;
    }
    window.open(DD.whatsappOrderUrl(), "_blank", "noopener");
  };

  return (
    <React.Fragment>
      <div className="cart-scrim" onClick={onClose} />
      <aside className="cart-drawer">
        <div className="cart-head">
          <h3>Tu carrito</h3>
          <button className="icon-x" onClick={onClose} aria-label="Cerrar"><I2.x /></button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <I2.cart style={{ width: 34, height: 34, opacity: 0.35 }} />
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <React.Fragment>
            <div className="cart-list">
              {lines.map(l => {
                const img = (l.product.images || [])[0];
                return (
                  <div className="cart-line" key={l.id}>
                    <div className={"cart-thumb" + (img ? "" : " ph")} style={img ? { backgroundImage: `url(${img})` } : null} />
                    <div className="cart-line-main">
                      <div className="cart-line-name">{l.product.name}</div>
                      <div className="cart-line-price">{DD.formatCOP(l.product.price)} c/u</div>
                      <div className="cart-line-bottom">
                        <div className="qty">
                          <button onClick={() => DD.setCartQty(l.id, l.qty - 1)} aria-label="Quitar uno"><I2.minus /></button>
                          <span>{l.qty}</span>
                          <button disabled={l.qty >= l.product.stock} onClick={() => DD.setCartQty(l.id, l.qty + 1)} aria-label="Agregar uno"><I2.plus /></button>
                        </div>
                        <span className="cart-line-sub">{DD.formatCOP(l.product.price * l.qty)}</span>
                      </div>
                    </div>
                    <button className="cart-remove" onClick={() => DD.removeFromCart(l.id)} aria-label="Eliminar"><I2.trash /></button>
                  </div>
                );
              })}
            </div>
            <div className="cart-foot">
              <div className="cart-total"><span>Total</span><strong>{DD.formatCOP(total)}</strong></div>
              <button className="btn-add lg" onClick={checkout}><I2.whatsapp style={{ width: 17, height: 17 }} />Enviar pedido por WhatsApp</button>
              <button className="cart-clear" onClick={() => DD.clearCart()}>Vaciar carrito</button>
            </div>
          </React.Fragment>
        )}
      </aside>
    </React.Fragment>
  );
}

/* Toast simple de la tienda */
function ShopToast() {
  const [msg, setMsg] = React.useState(null);
  React.useEffect(() => {
    window.shopToast = (m) => {
      setMsg(m);
      clearTimeout(window.__shopToastT);
      window.__shopToastT = setTimeout(() => setMsg(null), 2200);
    };
  }, []);
  if (!msg) return null;
  return <div className="shop-toast">{msg}</div>;
}

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

/* Enlaces sin destino real → "Próximamente"; con URL real → navega normal */
function footLink(e, href) {
  if (!href || href === "#") {
    e.preventDefault();
    window.shopToast && window.shopToast("Próximamente");
  }
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
                  <li key={j}><a href={l.href} onClick={e => footLink(e, l.href)}>{l.label}</a></li>
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
                  const real = s.href && s.href !== "#";
                  return <a key={i} className="social-btn" href={s.href} aria-label={s.name}
                    target={real ? "_blank" : undefined} rel={real ? "noopener" : undefined}
                    onClick={e => footLink(e, s.href)}><Icon /></a>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Barra legal */}
        <div className="footer-legal">
          <div className="legal-links">
            {(legal.links || []).map((l, i) => <a key={i} href={l.href} onClick={e => footLink(e, l.href)}>{l.label}</a>)}
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
  const real = data.href && data.href !== "#";
  const num = DD.getWhatsappNumber();

  const onClick = (e) => {
    if (real) return; // usa el enlace configurado
    e.preventDefault();
    if (num) window.open(`https://wa.me/${num}`, "_blank", "noopener");
    else window.shopToast && window.shopToast("Configura un WhatsApp en Admin → Contacto");
  };

  return (
    <a className="float-chat" href={real ? data.href : "#"} aria-label={data.label}
      target={real ? "_blank" : undefined} rel={real ? "noopener" : undefined} onClick={onClick}>
      <span className="fc-icon"><Icon /></span>
      <span className="fc-label">{data.label}</span>
    </a>
  );
}

Object.assign(window, { ClosingCampaign, Footer, FloatingChat, CartDrawer, ShopToast });
