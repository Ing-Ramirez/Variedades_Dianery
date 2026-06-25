/* Admin — Productos (tabla + crear/editar/eliminar + stock) */
const { AdminIcons: PI } = window;

const EMPTY_PRODUCT = { name: "", tag: "Hogar", desc: "", price: "", stock: "", sku: "", active: true };
const TAGS = ["Hogar", "Cocina", "Cuidado", "Papelería", "Accesorios", "Jardín", "Moda"];

function ProductDrawer({ product, onClose }) {
  const D = window.DianeryData;
  const [f, setF] = React.useState(product ? { ...product } : { ...EMPTY_PRODUCT });
  const isNew = !product;
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  const save = () => {
    if (!f.name.trim()) { window.adminToast("Ponle un nombre al producto"); return; }
    D.upsertProduct({
      ...f,
      name: f.name.trim(),
      price: Number(f.price) || 0,
      stock: Number(f.stock) || 0,
      sku: f.sku.trim() || ("SKU-" + Date.now().toString().slice(-5))
    });
    window.adminToast(isNew ? "Producto creado" : "Cambios guardados");
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
          <div className="field">
            <label>Nombre</label>
            <input className="input" value={f.name} onChange={e => set("name", e.target.value)} placeholder="Ej. Vela de soja lavanda" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Categoría</label>
              <select className="select" value={f.tag} onChange={e => set("tag", e.target.value)}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>SKU</label>
              <input className="input" value={f.sku} onChange={e => set("sku", e.target.value)} placeholder="Auto si se deja vacío" />
            </div>
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea className="textarea" value={f.desc} onChange={e => set("desc", e.target.value)} placeholder="Breve descripción visible en la tienda" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Precio (COP)</label>
              <input className="input" type="number" value={f.price} onChange={e => set("price", e.target.value)} placeholder="0" />
            </div>
            <div className="field">
              <label>Stock (unidades)</label>
              <input className="input" type="number" value={f.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
            </div>
          </div>
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
    const okQ = p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase());
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
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o SKU…" />
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
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-prod">
                      <div className="prod-thumb" />
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
              ))}
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
