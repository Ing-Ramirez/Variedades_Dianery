/* Admin — Dashboard */
const { AdminIcons: DI } = window;

function Dashboard({ go }) {
  const data = window.useData();
  const orders = data.getOrders();
  const products = data.getProducts();
  const metrics = data.getMetrics();
  const fmt = data.formatCOP;

  const active = orders.filter(o => o.status !== "Cancelado");
  const sales = active.reduce((s, o) => s + o.total, 0);
  const openOrders = orders.filter(o => o.status === "Nuevo" || o.status === "Preparando").length;
  const avg = active.length ? Math.round(sales / active.length) : 0;
  const lowStock = products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  const kpis = [
    { icon: "money", label: "Ventas del mes", value: fmt(sales), delta: 8.2, up: true },
    { icon: "cart", label: "Pedidos por atender", value: openOrders, delta: 3.1, up: true },
    { icon: "eye", label: "Visitas", value: metrics.visitsMonth.toLocaleString("es-CO"), delta: metrics.visitsDelta, up: true },
    { icon: "money", label: "Ticket promedio", value: fmt(avg), delta: 1.4, up: false }
  ];

  const maxV = Math.max(...metrics.salesByMonth.map(d => d.v));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Resumen</h1>
          <p className="page-sub">Vista general de tu tienda · Junio 2026</p>
        </div>
        <button className="btn btn-primary" onClick={() => go("productos")}><DI.plus />Nuevo producto</button>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => {
          const Icon = DI[k.icon];
          const Arrow = k.up ? DI.up : DI.down;
          return (
            <div className="kpi" key={i}>
              <div className="kpi-label"><Icon />{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className={"kpi-delta " + (k.up ? "up" : "down")}><Arrow />{k.delta}% vs. mes anterior</div>
            </div>
          );
        })}
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <h3 className="card-title">Ventas por mes</h3>
          <p className="page-sub" style={{ margin: "4px 0 0" }}>Millones de COP</p>
          <div className="chart">
            {metrics.salesByMonth.map((d, i) => (
              <div className="chart-col" key={i}>
                <div className={"chart-bar" + (i === metrics.salesByMonth.length - 1 ? " last" : "")}
                  style={{ height: (d.v / maxV * 100) + "%" }} title={d.v + "M"} />
                <div className="chart-x">{d.m}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="card-title">Stock bajo</h3>
          <p className="page-sub" style={{ margin: "4px 0 14px" }}>{lowStock.length} productos requieren reposición</p>
          {lowStock.length === 0 && <div className="empty">Todo en orden 🎉</div>}
          {lowStock.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--line-2)" }}>
              <div className="prod-thumb" style={{ width: 34, height: 34 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="prod-name" style={{ fontSize: 14 }}>{p.name}</div>
                <div className="prod-sku">{p.sku}</div>
              </div>
              <span className={p.stock === 0 ? "badge red" : "badge amber"}>{p.stock === 0 ? "Agotado" : p.stock + " uds"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-pad" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="card-title">Pedidos recientes</h3>
          <button className="btn btn-ghost" onClick={() => go("pedidos")}>Ver todos</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Ciudad</th><th>Fecha</th><th className="right">Total</th><th>Estado</th></tr></thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td className="num" style={{ fontWeight: 600 }}>#{o.id}</td>
                  <td>{o.customer}</td>
                  <td style={{ color: "var(--ink-3)" }}>{o.city}</td>
                  <td className="num" style={{ color: "var(--ink-3)" }}>{o.date}</td>
                  <td className="num right" style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                  <td><window.StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
