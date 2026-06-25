/* Admin — Clientes */
function Customers() {
  const data = window.useData();
  const fmt = data.formatCOP;
  const [q, setQ] = React.useState("");
  const { AdminIcons: CI } = window;
  const customers = data.getCustomers().filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()) || c.city.toLowerCase().includes(q.toLowerCase())
  );
  const initials = (n) => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-sub">{data.getCustomers().length} clientes registrados</p>
        </div>
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
              <tr><th>Cliente</th><th>Ciudad</th><th className="right">Pedidos</th><th className="right">Total gastado</th><th>Cliente desde</th></tr>
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
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan="5"><div className="empty">No hay clientes que coincidan.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.Customers = Customers;
