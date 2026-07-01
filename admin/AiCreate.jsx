/* Admin — Admin Inteligente AI: crea BORRADORES de producto desde una imagen
   + descripción natural. La IA solo sugiere (3 propuestas); el humano revisa,
   edita y aprueba. El producto se crea siempre oculto (active=false). */
const { AdminIcons: AII } = window;

function AiOptionCard({ option, index, onUse }) {
  const D = window.DianeryData;
  const style = option.style || ["Comercial", "Premium", "Directa"][index] || "Propuesta";
  const conf = Math.round(option.confidence || 0);
  return (
    <div className="card card-pad ai-card">
      <div className="ai-card-head">
        <span className="badge blue"><span className="dot" />Opción {index + 1}: {style}</span>
        <span className={"ai-conf " + (conf >= 70 ? "ok" : conf >= 40 ? "mid" : "low")}>Confianza {conf}%</span>
      </div>
      <h3 className="ai-card-title">{option.name}</h3>
      <p className="ai-card-desc">{option.short_description}</p>

      {option.features.length > 0 && (
        <div className="ai-block">
          <div className="ai-block-label">Características</div>
          <ul className="ai-list">{option.features.slice(0, 5).map((f, i) => <li key={i}>{f}</li>)}</ul>
        </div>
      )}

      <div className="ai-block">
        <div className="ai-block-label">SEO</div>
        <div className="ai-seo-title">{option.seo_title || "—"}</div>
        <div className="ai-seo-desc">{option.seo_description || "—"}</div>
      </div>

      <div className="ai-meta">
        <span>Categoría: <strong>{option.category_name || "—"}</strong></span>
        <span>SKU: <strong>{option.sku || "auto"}</strong></span>
        <span>Precio sugerido: <strong>{option.suggested_price != null ? D.formatCOP(option.suggested_price) : "—"}</strong></span>
      </div>

      {option.warnings.length > 0 && (
        <div className="ai-warnings">
          {option.warnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
        </div>
      )}

      <button className="btn btn-primary ai-use" onClick={() => onUse(index)}><AII.check />Usar esta opción</button>
    </div>
  );
}

function AiCreate({ go }) {
  const D = window.DianeryData;
  const data = window.useData();
  const cats = data.getCategories();

  const [image, setImage] = React.useState("");        // data URL (reescalada)
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [models, setModels] = React.useState([]);
  const [model, setModel] = React.useState("");
  const [busy, setBusy] = React.useState("");           // "", "analyze", "refine", "create"
  const [error, setError] = React.useState("");
  const [options, setOptions] = React.useState(null);
  const [selected, setSelected] = React.useState(-1);
  const [form, setForm] = React.useState(null);         // campos REALES editables
  const [refineText, setRefineText] = React.useState("");
  const [created, setCreated] = React.useState(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    D.aiModels().then(r => {
      setModels(r.models || []);
      setModel(r.default || (r.models && r.models[0] && r.models[0].id) || "");
    }).catch(e => setError(String(e.message || e)));
  }, []);

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError("");
    try { setImage(await window.readImageFile(file)); }
    catch (msg) { setError(typeof msg === "string" ? msg : "Formato de imagen no permitido"); }
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyze = () => {
    setError(""); setOptions(null); setSelected(-1); setForm(null); setCreated(null);
    if (!image) { setError("Sube una imagen del producto."); return; }
    if (description.trim().length < 5) { setError("Describe el producto (mínimo 5 caracteres)."); return; }
    setBusy("analyze");
    D.aiAnalyze({ image, description: description.trim(), category, model })
      .then(r => { setOptions(r.options || []); })
      .catch(e => setError(String(e.message || e)))
      .then(() => setBusy(""));
  };

  const useOption = (i) => {
    const o = options[i];
    setSelected(i);
    setForm({
      name: o.name,
      tag: cats.includes(o.category_name) ? o.category_name : (category || cats[0] || ""),
      sku: o.sku || "",
      desc: o.short_description + (o.features.length ? "\n\n• " + o.features.slice(0, 4).join("\n• ") : ""),
      price: o.suggested_price != null ? String(Math.round(o.suggested_price)) : "",
      stock: "0"
    });
    setCreated(null);
  };

  const refine = () => {
    if (selected < 0 || !refineText.trim()) return;
    setError(""); setBusy("refine");
    D.aiRefine({ option: options[selected], instruction: refineText.trim(), model })
      .then(r => {
        const next = options.slice();
        next[selected] = r.option;
        setOptions(next);
        setRefineText("");
        useOptionFrom(r.option);
      })
      .catch(e => setError(String(e.message || e)))
      .then(() => setBusy(""));
  };
  const useOptionFrom = (o) => {
    setForm(f => ({
      ...(f || {}),
      name: o.name,
      tag: cats.includes(o.category_name) ? o.category_name : ((f && f.tag) || cats[0] || ""),
      sku: o.sku || (f && f.sku) || "",
      desc: o.short_description + (o.features.length ? "\n\n• " + o.features.slice(0, 4).join("\n• ") : ""),
      price: o.suggested_price != null ? String(Math.round(o.suggested_price)) : ((f && f.price) || ""),
      stock: (f && f.stock) || "0"
    }));
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createDraft = () => {
    setError("");
    if (!form || !form.name.trim() || !form.tag) { setError("Completa el nombre y la categoría."); return; }
    setBusy("create");
    D.aiCreateDraft({
      option: options[selected],
      image,
      description: description.trim(),
      name: form.name.trim(),
      tag: form.tag,
      sku: form.sku.trim(),
      desc: form.desc.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      model
    })
      .then(r => {
        D.addLocalProduct(r.product); // ya está en el servidor; reflejarlo en local
        setCreated(r.product);
        window.adminToast("Borrador creado · revísalo en Productos");
      })
      .catch(e => setError(String(e.message || e)))
      .then(() => setBusy(""));
  };

  const reset = () => {
    setImage(""); setDescription(""); setCategory(""); setOptions(null);
    setSelected(-1); setForm(null); setCreated(null); setError("");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Admin Inteligente AI</h1>
          <p className="page-sub">Sube una foto, describe el producto y recibe 3 propuestas. La IA nunca publica: solo crea borradores que tú apruebas.</p>
        </div>
      </div>

      {error && <div className="form-errors"><strong>Atención:</strong> {error}</div>}

      {/* Paso 1: entrada */}
      <div className="card card-pad">
        <h3 className="card-title" style={{ marginBottom: 14 }}>1 · Cuéntale a la IA sobre tu producto</h3>
        <div className="ai-input-grid">
          <div>
            <label className="ai-label">Imagen del producto *</label>
            {image
              ? <div className="ai-photo" style={{ backgroundImage: `url(${image})` }} />
              : <button type="button" className="ai-photo empty" onClick={() => inputRef.current && inputRef.current.click()}><AII.plus /><span>Subir imagen</span></button>}
            {image && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-ghost btn-compact" onClick={() => inputRef.current && inputRef.current.click()}>Cambiar</button>
                <button className="btn btn-ghost btn-compact" onClick={() => setImage("")}>Quitar</button>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onFile} />
          </div>
          <div>
            <label className="ai-label">Descripción natural *</label>
            <textarea className="textarea" rows="5" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Pestañina a prueba de agua, efecto volumen, cerdas de silicona, dura todo el día…" />
            <div className="field-row" style={{ marginTop: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Categoría (opcional)</label>
                <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">La IA sugiere</option>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Modelo de IA</label>
                <select className="select" value={model} onChange={e => setModel(e.target.value)}>
                  {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button className="btn btn-primary" disabled={busy !== ""} onClick={analyze}>
            <AII.ai />{busy === "analyze" ? "Analizando… (puede tardar un minuto)" : "Analizar con Admin Inteligente AI"}
          </button>
        </div>
      </div>

      {/* Paso 2: propuestas */}
      {options && options.length > 0 && (
        <React.Fragment>
          <h3 className="ai-step-title">2 · Elige una propuesta</h3>
          <div className="ai-grid">
            {options.map((o, i) => <AiOptionCard key={i} option={o} index={i} onUse={useOption} />)}
          </div>
        </React.Fragment>
      )}

      {/* Paso 3: vista previa editable */}
      {form && selected >= 0 && !created && (
        <div className="card card-pad" style={{ marginTop: 16 }}>
          <h3 className="card-title" style={{ marginBottom: 4 }}>3 · Revisa y edita antes de crear</h3>
          <p className="page-sub" style={{ margin: "0 0 16px" }}>Estos son los campos reales del producto. El borrador se crea <strong>oculto</strong>; lo activas cuando quieras desde Productos.</p>

          <div className="field"><label>Nombre *</label>
            <input className="input" value={form.name} onChange={e => setF("name", e.target.value)} /></div>
          <div className="field-row">
            <div className="field"><label>Categoría *</label>
              <select className="select" value={form.tag} onChange={e => setF("tag", e.target.value)}>
                {[...new Set([...cats, form.tag].filter(Boolean))].map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div className="field"><label>SKU</label>
              <input className="input" value={form.sku} onChange={e => setF("sku", e.target.value)} placeholder="Auto si se deja vacío" /></div>
          </div>
          <div className="field"><label>Descripción</label>
            <textarea className="textarea" rows="5" value={form.desc} onChange={e => setF("desc", e.target.value)} /></div>
          <div className="field-row">
            <div className="field"><label>Precio (COP)</label>
              <input className="input" type="number" min="0" value={form.price} onChange={e => setF("price", e.target.value)} /></div>
            <div className="field"><label>Stock inicial</label>
              <input className="input" type="number" min="0" value={form.stock} onChange={e => setF("stock", e.target.value)} /></div>
          </div>

          <div className="ai-refine">
            <label className="ai-label">¿Quieres ajustar el texto con la IA? (opcional)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" value={refineText} onChange={e => setRefineText(e.target.value)}
                placeholder="Ej: hazlo más corto y menciona que es hipoalergénica" />
              <button className="btn btn-ghost" disabled={busy !== "" || !refineText.trim()} onClick={refine}>
                {busy === "refine" ? "Refinando…" : "Refinar"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn btn-primary" disabled={busy !== ""} onClick={createDraft}>
              <AII.check />{busy === "create" ? "Creando borrador…" : "Crear borrador de producto"}
            </button>
          </div>
        </div>
      )}

      {/* Éxito */}
      {created && (
        <div className="card card-pad ai-done" style={{ marginTop: 16 }}>
          <h3 className="card-title">✅ Borrador creado</h3>
          <p className="page-sub" style={{ margin: "6px 0 14px" }}>
            <strong>{created.name}</strong> (SKU {created.sku}) quedó guardado como <strong>oculto</strong>. No aparece en la tienda hasta que lo actives.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" onClick={() => go && go("productos")}><AII.box />Revisarlo en Productos</button>
            <button className="btn btn-ghost" onClick={reset}><AII.plus />Crear otro producto</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.AiCreate = AiCreate;
