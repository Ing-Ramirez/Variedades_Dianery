/* Admin — Pedidos (lista + cambio de estado en línea) */
const { AdminIcons: OI } = window;

function Orders() {
  const data = window.useData();
  const fmt = data.formatCOP;
  const [filter, setFilter] = React.useState("Todos");
  const orders = data.getOrders();
  const statuses = ["Todos", ...window.ORDER_STATUSES];

  const filtered = filter === "Todos" ? orders : orders.filter(o => o.status === filter);
  const counts = {};
  window.ORDER_STATUSES.forEach(s => counts[s] = orders.filter(o => o.status === s).length);

  const changeStatus = (id, status) => {
    data.setOrderStatus(id, status);
    window.adminToast("Estado actualizado · #" + id);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-sub">{orders.length} pedidos · {counts["Nuevo"]} nuevos por atender</p>
        </div>
      </div>

      <div className="toolbar2">
        <div className="seg">
          {statuses.map(s => (
            <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>
              {s}{s !== "Todos" && counts[s] ? ` (${counts[s]})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Ciudad</th><th>Fecha</th><th className="right">Items</th><th className="right">Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="num" style={{ fontWeight: 600 }}>#{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.customer}</td>
                  <td style={{ color: "var(--ink-3)" }}>{o.city}</td>
                  <td className="num" style={{ color: "var(--ink-3)" }}>{o.date}</td>
                  <td className="num right">{o.items}</td>
                  <td className="num right" style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                  <td>
                    <select className="status-select" value={o.status} onChange={e => changeStatus(o.id, e.target.value)}>
                      {window.ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7"><div className="empty">Sin pedidos en este estado.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.Orders = Orders;
