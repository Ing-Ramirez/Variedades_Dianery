/* Admin — Productos (tabla + crear/editar/eliminar + stock + imágenes) */
const { AdminIcons: PI } = window;

const EMPTY_PRODUCT = { name: "", tag: "Hogar", desc: "", price: "", stock: "", sku: "", active: true, images: [] };
const TAGS = ["Hogar", "Cocina", "Cuidado", "Papelería", "Accesorios", "Jardín", "Moda"];

/* Lee un archivo de imagen, valida formato y lo reescala a un data URL liviano */
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const type = (file.type || "").toLowerCase();
    if (!window.DianeryData.ALLOWED_IMAGE_TYPES.includes(type)) {
      reject("Formato de imagen no permitido. Usa JPG, JPEG, PNG o WEBP.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject("No se pudo leer la imagen.");
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject("La imagen está dañada o no es válida.");
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const r = Math.min(MAX / width, MAX / height);
          width = Math.round(width * r); height = Math.round(height * r);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const outType = type === "image/png" || type === "image/webp" ? type : "image/jpeg";
        resolve(canvas.toDataURL(outType, 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Gestor de imágenes: principal + galería, máx 5, reordenar / eliminar / cambiar principal */
function ImageManager({ images, onChange }) {
  const inputRef = React.useRef(null);
  const MAX = window.DianeryData.MAX_IMAGES;

  const addFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    const room = MAX - images.length;
    if (room <= 0) { window.adminToast("Máximo " + MAX + " imágenes por producto"); return; }
    const next = [...images];
    for (const file of files.slice(0, room)) {
      try { next.push(await readImageFile(file)); }
      catch (msg) { window.adminToast(typeof msg === "string" ? msg : "Formato de imagen no permitido"); }
    }
    if (files.length > room) window.adminToast("Máximo " + MAX + " imágenes por producto");
    if (next.length !== images.length) onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const makeMain = (i) => { if (i === 0) return; const next = [...images]; const [img] = next.splice(i, 1); next.unshift(img); onChange(next); };
  const remove = (i) => onChange(images.filter((_, k) => k !== i));

  return (
    <div className="field">
      <label>Imágenes <span className="hint" style={{ display: "inline", marginLeft: 4 }}>({images.length}/{MAX} · la primera es la principal)</span></label>
      <div className="img-grid">
        {images.map((src, i) => (
          <div key={i} className={"img-thumb" + (i === 0 ? " is-main" : "")}>
            <img src={src} alt={"Imagen " + (i + 1)} />
            {i === 0 && <span className="img-main-badge">Principal</span>}
            <div className="img-actions">
              <button type="button" title="Mover antes" disabled={i === 0} onClick={() => move(i, -1)}><PI.up /></button>
              <button type="button" title="Mover después" disabled={i === images.length - 1} onClick={() => move(i, 1)}><PI.down /></button>
              {i !== 0 && <button type="button" title="Hacer principal" onClick={() => makeMain(i)}><PI.check /></button>}
              <button type="button" className="danger" title="Eliminar" onClick={() => remove(i)}><PI.trash /></button>
            </div>
          </div>
        ))}
        {images.length < MAX && (
          <button type="button" className="img-add" onClick={() => inputRef.current && inputRef.current.click()}>
            <PI.plus /><span>Agregar</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
        onChange={e => addFiles(e.target.files)} />
      <div className="hint">Formatos: JPG, JPEG, PNG, WEBP. Se previsualizan antes de guardar.</div>
    </div>
  );
}

function ProductDrawer({ product, onClose }) {
  const D = window.DianeryData;
  const [f, setF] = React.useState(product ? { images: [], ...product } : { ...EMPTY_PRODUCT });
  const [errors, setErrors] = React.useState([]);
  const isNew = !product;
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  const save = () => {
    const candidate = {
      ...f,
      name: f.name.trim(),
      tag: f.tag,
      sku: f.sku.trim() || ("SKU-" + Date.now().toString().slice(-5))
    };
    const errs = D.validateProduct(candidate);
    if (errs.length) { setErrors(errs); window.adminToast("Completa los campos obligatorios"); return; }
    const res = D.upsertProduct(candidate);
    if (!res.ok) { setErrors(res.errors); window.adminToast("Error al guardar el producto"); return; }
    window.adminToast(isNew ? "Producto creado correctamente" : "Producto actualizado correctamente");
    onClose();
  };

  return (
    <React.Fragment>
      <div className="drawer-scrim" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <h3>{isNew ? "Nuevo producto" : "Editar producto"}</h3>
          <button className="icon-btn" onClick={onClose}><PI.x /></button>
        </div>
        <div className="drawer-body">
          {errors.length > 0 && (
            <div className="form-errors">
              <strong>Revisa estos campos:</strong>
              <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
          <div className="field">
            <label>Nombre *</label>
            <input className="input" value={f.name} onChange={e => set("name", e.target.value)} placeholder="Ej. Vela de soja lavanda" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Categoría *</label>
              <select className="select" value={f.tag} onChange={e => set("tag", e.target.value)}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>SKU *</label>
              <input className="input" value={f.sku} onChange={e => set("sku", e.target.value)} placeholder="Auto si se deja vacío" />
            </div>
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea className="textarea" value={f.desc} onChange={e => set("desc", e.target.value)} placeholder="Breve descripción visible en la tienda" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Precio (COP) *</label>
              <input className="input" type="number" min="0" value={f.price} onChange={e => set("price", e.target.value)} placeholder="0" />
            </div>
            <div className="field">
              <label>Stock (unidades) *</label>
              <input className="input" type="number" min="0" value={f.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
            </div>
          </div>

          <ImageManager images={f.images || []} onChange={imgs => set("images", imgs)} />

          <div className="field">
            <label>Estado en la tienda</label>
            <label className="switch">
              <input type="checkbox" checked={f.active} onChange={e => set("active", e.target.checked)} />
              <span className="track" />
              <span>{f.active ? "Visible (activo)" : "Oculto (inactivo)"}</span>
            </label>
            <div className="hint">Los productos inactivos no aparecen en el catálogo.</div>
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}><PI.check />{isNew ? "Crear producto" : "Guardar"}</button>
        </div>
      </div>
    </React.Fragment>
  );
}

function Products() {
  const data = window.useData();
  const fmt = data.formatCOP;
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("Todos");
  const [drawer, setDrawer] = React.useState(null); // null | {} | product

  const products = data.getProducts().filter(p => {
    const needle = q.toLowerCase();
    const okQ = p.name.toLowerCase().includes(needle) || (p.sku || "").toLowerCase().includes(needle) || (p.tag || "").toLowerCase().includes(needle);
    const okF = filter === "Todos" || (filter === "Activos" && p.active) || (filter === "Inactivos" && !p.active) || (filter === "Stock bajo" && p.stock <= 5);
    return okQ && okF;
  });

  const remove = (p) => {
    if (confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) {
      data.deleteProduct(p.id);
      window.adminToast("Producto eliminado");
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-sub">{data.getProducts().length} productos en el catálogo</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDrawer({})}><PI.plus />Nuevo producto</button>
      </div>

      <div className="toolbar2">
        <div className="search2">
          <PI.search />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, SKU o categoría…" />
        </div>
        <div className="seg">
          {["Todos", "Activos", "Inactivos", "Stock bajo"].map(s => (
            <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th className="right">Precio</th><th>Stock</th><th>Estado</th><th className="right">Acciones</th></tr>
            </thead>
            <tbody>
              {products.map(p => {
                const main = (p.images || [])[0];
                return (
                <tr key={p.id}>
                  <td>
                    <div className="cell-prod">
                      <div className="prod-thumb" style={main ? { backgroundImage: `url(${main})`, backgroundSize: "cover", backgroundPosition: "center" } : null} />
                      <div><div className="prod-name">{p.name}</div><div className="prod-sku">{p.sku}</div></div>
                    </div>
                  </td>
                  <td><span className="tag-chip">{p.tag}</span></td>
                  <td className="num right" style={{ fontWeight: 600 }}>{fmt(p.price)}</td>
                  <td><window.StockCell stock={p.stock} /></td>
                  <td><span className={p.active ? "badge green" : "badge gray"}><span className="dot" />{p.active ? "Activo" : "Inactivo"}</span></td>
                  <td className="right">
                    <div style={{ display: "inline-flex", gap: 7 }}>
                      <button className="icon-btn" onClick={() => setDrawer(p)} title="Editar"><PI.edit /></button>
                      <button className="icon-btn danger" onClick={() => remove(p)} title="Eliminar"><PI.trash /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {products.length === 0 && <tr><td colSpan="6"><div className="empty">No hay productos que coincidan.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {drawer !== null && <ProductDrawer product={drawer.id ? drawer : null} onClose={() => setDrawer(null)} />}
    </div>
  );
}

window.Products = Products;
