/* Admin — Shell: top nav + router simple */
const { AdminIcons: SHI } = window;

const NAV = [
  { id: "dashboard", label: "Resumen", icon: "dashboard" },
  { id: "productos", label: "Productos", icon: "box" },
  { id: "pedidos", label: "Pedidos", icon: "cart" },
  { id: "clientes", label: "Clientes", icon: "users" },
  { id: "config", label: "Configuración", icon: "settings" }
];

function AdminShell() {
  const hash = (window.location.hash || "#dashboard").slice(1);
  const [page, setPage] = React.useState(NAV.some(n => n.id === hash) ? hash : "dashboard");
  const toast = window.useToast();
  const config = window.useData().getConfig();

  const go = (id) => { setPage(id); window.location.hash = id; window.scrollTo(0, 0); };

  React.useEffect(() => {
    const h = () => { const id = (window.location.hash || "#dashboard").slice(1); if (NAV.some(n => n.id === id)) setPage(id); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  return (
    <React.Fragment>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-mark">
            <div className="brand-logo">VD</div>
            <div>
              <div className="brand-name">{config.brandName}</div>
              <div className="brand-badge">Admin</div>
            </div>
          </div>
          <nav className="top-nav">
            {NAV.map(n => {
              const Icon = SHI[n.icon];
              return (
                <button key={n.id} className={page === n.id ? "active" : ""} onClick={() => go(n.id)}>
                  <Icon /><span>{n.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="top-right">
            <a className="view-store" href="../" target="_blank" rel="noopener">
              <SHI.store />Ver tienda<SHI.external />
            </a>
            <div className="avatar">DM</div>
          </div>
        </div>
      </header>

      {page === "dashboard" && <window.Dashboard go={go} />}
      {page === "productos" && <window.Products />}
      {page === "pedidos" && <window.Orders />}
      {page === "clientes" && <window.Customers />}
      {page === "config" && <window.Settings />}

      <window.Toast msg={toast} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminShell />);
