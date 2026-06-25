/* Admin — Configuración general (se refleja en la tienda) */
const { AdminIcons: SI } = window;
const SOCIAL_ICONS = ["instagram", "facebook", "tiktok", "youtube", "linkedin"];

function Field({ label, children, hint }) {
  return <div className="field"><label>{label}</label>{children}{hint && <div className="hint">{hint}</div>}</div>;
}

function Settings() {
  const D = window.DianeryData;
  const [f, setF] = React.useState(() => JSON.parse(JSON.stringify(D.getConfig())));
  const [tab, setTab] = React.useState("marca");
  const set = (path, v) => setF(s => {
    const n = JSON.parse(JSON.stringify(s));
    const keys = path.split(".");
    let o = n; for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = v;
    return n;
  });

  const save = () => { D.saveConfig(f); window.adminToast("Configuración guardada · visible en la tienda"); };

  const setSocial = (i, k, v) => setF(s => {
    const n = JSON.parse(JSON.stringify(s));
    n.socialLinks[i][k] = v;
    return n;
  });
  const addSocial = () => setF(s => ({ ...s, socialLinks: [...s.socialLinks, { name: "Nueva red", href: "#", icon: "instagram" }] }));
  const delSocial = (i) => setF(s => ({ ...s, socialLinks: s.socialLinks.filter((_, j) => j !== i) }));

  const tabs = [
    { id: "marca", label: "Marca" },
    { id: "banner", label: "Banner" },
    { id: "cierre", label: "Cierre de campaña" },
    { id: "contacto", label: "Contacto" },
    { id: "redes", label: "Redes sociales" },
    { id: "chat", label: "Chat flotante" }
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Configuración general</h1>
          <p className="page-sub">Estos cambios se reflejan en la tienda</p>
        </div>
        <button className="btn btn-primary" onClick={save}><SI.check />Guardar cambios</button>
      </div>

      <div className="cfg-grid">
        <div className="cfg-nav">
          {tabs.map(t => <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>

        <div className="cfg-section">
          {tab === "marca" && (
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 18 }}>Identidad de la tienda</h3>
              <Field label="Nombre de la tienda"><input className="input" value={f.brandName} onChange={e => set("brandName", e.target.value)} /></Field>
              <Field label="Eslogan / descriptor" hint="Aparece bajo el nombre en el encabezado y el footer.">
                <input className="input" value={f.tagline} onChange={e => set("tagline", e.target.value)} />
              </Field>
            </div>
          )}

          {tab === "banner" && (
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 18 }}>Banner principal</h3>
              <Field label="Texto pequeño (kicker)"><input className="input" value={f.bannerKicker} onChange={e => set("bannerKicker", e.target.value)} /></Field>
              <Field label="Título grande"><input className="input" value={f.bannerTitle} onChange={e => set("bannerTitle", e.target.value)} /></Field>
            </div>
          )}

          {tab === "cierre" && (
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 18 }}>Bloque de cierre de campaña</h3>
              <Field label="Mostrar en la tienda">
                <label className="switch"><input type="checkbox" checked={f.closing.enabled} onChange={e => set("closing.enabled", e.target.checked)} /><span className="track" /><span className={`switch-status ${f.closing.enabled ? "is-on" : "is-off"}`}>{f.closing.enabled ? "Activado" : "Desactivado"}</span></label>
              </Field>
              <Field label="Texto pequeño"><input className="input" value={f.closing.kicker} onChange={e => set("closing.kicker", e.target.value)} /></Field>
              <Field label="Frase principal"><input className="input" value={f.closing.title} onChange={e => set("closing.title", e.target.value)} /></Field>
              <Field label="Hashtag / claim destacado" hint="Se muestra con el color de la marca."><input className="input" value={f.closing.highlightedText} onChange={e => set("closing.highlightedText", e.target.value)} /></Field>
            </div>
          )}

          {tab === "contacto" && (
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 18 }}>Datos de contacto</h3>
              <p className="page-sub" style={{ margin: "0 0 18px" }}>Deja vacío cualquier campo que no quieras mostrar.</p>
              <Field label="Título del bloque"><input className="input" value={f.contact.title} onChange={e => set("contact.title", e.target.value)} /></Field>
              <div className="field-row">
                <Field label="Teléfono"><input className="input" value={f.contact.phone} onChange={e => set("contact.phone", e.target.value)} /></Field>
                <Field label="WhatsApp"><input className="input" value={f.contact.whatsapp} onChange={e => set("contact.whatsapp", e.target.value)} /></Field>
              </div>
              <Field label="Email"><input className="input" value={f.contact.email} onChange={e => set("contact.email", e.target.value)} /></Field>
              <Field label="Horario de atención"><input className="input" value={f.contact.schedule} onChange={e => set("contact.schedule", e.target.value)} /></Field>
            </div>
          )}

          {tab === "redes" && (
            <div className="card card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 className="card-title">Redes sociales</h3>
                <button className="btn btn-ghost" onClick={addSocial}><SI.plus />Agregar</button>
              </div>
              <p className="page-sub" style={{ margin: "0 0 18px" }}>Si una red no está en la lista, no se muestra en la tienda.</p>
              {f.socialLinks.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: 10, alignItems: "end", marginBottom: 12 }}>
                  <Field label="Ícono">
                    <select className="select" value={s.icon} onChange={e => setSocial(i, "icon", e.target.value)}>
                      {SOCIAL_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </Field>
                  <Field label="Enlace"><input className="input" value={s.href} onChange={e => setSocial(i, "href", e.target.value)} placeholder="https://…" /></Field>
                  <button className="icon-btn danger" style={{ marginBottom: 18 }} onClick={() => delSocial(i)}><SI.trash /></button>
                </div>
              ))}
              {f.socialLinks.length === 0 && <div className="empty">Sin redes configuradas.</div>}
            </div>
          )}

          {tab === "chat" && (
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 18 }}>Botón flotante de chat</h3>
              <Field label="Mostrar en la tienda">
                <label className="switch"><input type="checkbox" checked={f.chat.enabled} onChange={e => set("chat.enabled", e.target.checked)} /><span className="track" /><span className={`switch-status ${f.chat.enabled ? "is-on" : "is-off"}`}>{f.chat.enabled ? "Activado" : "Desactivado"}</span></label>
              </Field>
              <Field label="Texto del botón"><input className="input" value={f.chat.label} onChange={e => set("chat.label", e.target.value)} /></Field>
              <Field label="Enlace (WhatsApp u otro)" hint="Ej. https://wa.me/57300...">
                <input className="input" value={f.chat.href} onChange={e => set("chat.href", e.target.value)} />
              </Field>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={save}><SI.check />Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Settings = Settings;
