/* Admin — Dashboard */
const { AdminIcons: DI } = window;

function Dashboard({ go }) {
  const data = window.useData();
  const orders = data.getOrders();
  const products = data.getProducts();
  const visits = data.getVisits();
  const fmt = data.formatCOP;

  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const now = new Date();
  const ymOf = (d) => String(d || "").slice(0, 7);                 // "YYYY-MM" desde "YYYY-MM-DD"
  const keyOf = (dt) => dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0");
  const curKey = keyOf(now);
  const prevKey = keyOf(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const valid = orders.filter(o => o.status !== "Cancelado");
  const inMonth = (k) => valid.filter(o => ymOf(o.date) === k);
  const sumTotal = (list) => list.reduce((s, o) => s + (o.total || 0), 0);

  const monthOrders = inMonth(curKey);
  const prevOrders = inMonth(prevKey);
  const salesMonth = sumTotal(monthOrders);
  const salesPrev = sumTotal(prevOrders);
  const ticketMonth = monthOrders.length ? Math.round(salesMonth / monthOrders.length) : 0;
  const ticketPrev = prevOrders.length ? Math.round(salesPrev / prevOrders.length) : 0;
  const openOrders = orders.filter(o => o.status === "Nuevo" || o.status === "Preparando").length;
  const lowT = (() => { const t = (data.getConfig() || {}).lowStockThreshold; return t != null ? t : 5; })();
  const lowStock = products.filter(p => p.stock <= lowT).sort((a, b) => a.stock - b.stock);

  // % de cambio mes vs. mes anterior; null = sin base para comparar (oculta el delta).
  const mkDelta = (cur, prev) => {
    let d;
    if (!prev) d = cur ? 100 : null;
    else d = Math.round((cur - prev) / prev * 1000) / 10;
    return d === null ? {} : { delta: Math.abs(d), up: d >= 0 };
  };

  const kpis = [
    Object.assign({ icon: "money", label: "Ventas del mes", value: fmt(salesMonth) }, mkDelta(salesMonth, salesPrev)),
    Object.assign({ icon: "cart", label: "Pedidos por atender", value: openOrders }, mkDelta(monthOrders.length, prevOrders.length)),
    Object.assign({ icon: "eye", label: "Visitas", value: (visits.month || 0).toLocaleString("es-CO") }, mkDelta(visits.month, visits.prev)),
    Object.assign({ icon: "money", label: "Ticket promedio", value: fmt(ticketMonth) }, mkDelta(ticketMonth, ticketPrev))
  ];

  // Ventas por mes: últimos 6 meses, calculadas de los pedidos reales.
  const chart = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chart.push({ m: MESES[dt.getMonth()], v: sumTotal(inMonth(keyOf(dt))) });
  }
  const maxV = Math.max(1, ...chart.map(d => d.v));
  const subtitle = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Resumen</h1>
          <p className="page-sub">Vista general de tu tienda · {subtitle}</p>
        </div>
        <button className="btn btn-primary" onClick={() => go("productos")}><DI.plus />Nuevo producto</button>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => {
          const Icon = DI[k.icon];
          const hasDelta = typeof k.delta === "number";
          const Arrow = k.up ? DI.up : DI.down;
          return (
            <div className="kpi" key={i}>
              <div className="kpi-label"><Icon />{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              {hasDelta && <div className={"kpi-delta " + (k.up ? "up" : "down")}><Arrow />{k.delta}% vs. mes anterior</div>}
            </div>
          );
        })}
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <h3 className="card-title">Ventas por mes</h3>
          <p className="page-sub" style={{ margin: "4px 0 0" }}>Últimos 6 meses · COP</p>
          <div className="chart">
            {chart.map((d, i) => (
              <div className="chart-col" key={i}>
                <div className={"chart-bar" + (i === chart.length - 1 ? " last" : "")}
                  style={{ height: (d.v / maxV * 100) + "%" }} title={fmt(d.v)} />
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
