/* Admin — Clientes (tabla + crear/editar/eliminar) */
const { AdminIcons: CI } = window;
const EMPTY_CUSTOMER = { name: "", email: "", city: "", orders: 0, spent: 0, since: "" };

function CustomerDrawer({ customer, onClose }) {
  const D = window.DianeryData;
  const [f, setF] = React.useState(customer ? { ...customer } : { ...EMPTY_CUSTOMER });
  const [errors, setErrors] = React.useState([]);
  const isNew = !customer;
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  const save = () => {
    const errs = D.validateCustomer(f);
    if (errs.length) { setErrors(errs); window.adminToast("Revisa los campos obligatorios"); return; }
    const res = D.upsertCustomer(f);
    if (!res.ok) { setErrors(res.errors); window.adminToast("Error al guardar el cliente"); return; }
    window.adminToast(isNew ? "Cliente creado correctamente" : "Cliente actualizado correctamente");
    onClose();
  };

  return (
    <React.Fragment>
      <div className="drawer-scrim" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <h3>{isNew ? "Nuevo cliente" : "Editar cliente"}</h3>
          <button className="icon-btn" onClick={onClose}><CI.x /></button>
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
            <input className="input" value={f.name} onChange={e => set("name", e.target.value)} placeholder="Ej. Laura Restrepo" />
          </div>
          <div className="field">
            <label>Email *</label>
            <input className="input" type="email" value={f.email} onChange={e => set("email", e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="field">
            <label>Ciudad</label>
            <input className="input" value={f.city} onChange={e => set("city", e.target.value)} placeholder="Ej. Medellín" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Pedidos</label>
              <input className="input" type="number" min="0" value={f.orders} onChange={e => set("orders", e.target.value)} />
            </div>
            <div className="field">
              <label>Total gastado (COP)</label>
              <input className="input" type="number" min="0" value={f.spent} onChange={e => set("spent", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Cliente desde</label>
            <input className="input" type="date" value={f.since} onChange={e => set("since", e.target.value)} />
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}><CI.check />{isNew ? "Crear cliente" : "Guardar"}</button>
        </div>
      </div>
    </React.Fragment>
  );
}

function Customers() {
  const data = window.useData();
  const fmt = data.formatCOP;
  const [q, setQ] = React.useState("");
  const [drawer, setDrawer] = React.useState(null); // null | {} | customer
  const customers = data.getCustomers().filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || (c.email || "").toLowerCase().includes(q.toLowerCase()) || (c.city || "").toLowerCase().includes(q.toLowerCase())
  );
  const initials = (n) => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  const remove = (c) => {
    if (confirm(`¿Eliminar a "${c.name}"? Esta acción no se puede deshacer.`)) {
      data.deleteCustomer(c.id);
      window.adminToast("Cliente eliminado");
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-sub">{data.getCustomers().length} clientes registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setDrawer({})}><CI.plus />Nuevo cliente</button>
      </div>

      <div className="toolbar2">
        <div className="search2">
          <CI.search />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, email o ciudad…" />
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Cliente</th><th>Ciudad</th><th className="right">Pedidos</th><th className="right">Total gastado</th><th>Cliente desde</th><th className="right">Acciones</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-prod">
                      <div className="avatar" style={{ width: 38, height: 38 }}>{initials(c.name)}</div>
                      <div><div className="prod-name">{c.name}</div><div className="prod-sku" style={{ fontFamily: "var(--font)", textTransform: "none" }}>{c.email}</div></div>
                    </div>
                  </td>
                  <td style={{ color: "var(--ink-3)" }}>{c.city}</td>
                  <td className="num right" style={{ fontWeight: 600 }}>{c.orders}</td>
                  <td className="num right" style={{ fontWeight: 600 }}>{fmt(c.spent)}</td>
                  <td className="num" style={{ color: "var(--ink-3)" }}>{c.since}</td>
                  <td className="right">
                    <div style={{ display: "inline-flex", gap: 7 }}>
                      <button className="icon-btn" onClick={() => setDrawer(c)} title="Editar"><CI.edit /></button>
                      <button className="icon-btn danger" onClick={() => remove(c)} title="Eliminar"><CI.trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan="6"><div className="empty">No hay clientes que coincidan.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {drawer !== null && <CustomerDrawer customer={drawer.id ? drawer : null} onClose={() => setDrawer(null)} />}
    </div>
  );
}

window.Customers = Customers;
