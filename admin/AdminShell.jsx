/* Admin - Shell: acceso, top nav y router simple */
const { AdminIcons: SHI } = window;

const NAV = [
  { id: "dashboard", label: "Resumen", icon: "dashboard" },
  { id: "productos", label: "Productos", icon: "box" },
  { id: "pedidos", label: "Pedidos", icon: "cart" },
  { id: "clientes", label: "Clientes", icon: "users" },
  { id: "config", label: "Configuracion", icon: "settings" }
];

function AdminLogin() {
  const [token, setToken] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setChecking(true);
    const ok = await window.DianeryData.verifyAdminToken(token);
    setChecking(false);
    if (!ok) {
      setError("Token invalido o no configurado en el servidor.");
      return;
    }
    window.DianeryData.setAdminToken(token, remember);
    if (window.adminToast) window.adminToast("Acceso de administrador confirmado.");
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand-logo">VD</div>
        <h1>Acceso administrador</h1>
        <form onSubmit={submit}>
          <label>
            Token de administracion
            <input
              type="password"
              value={token}
              autoComplete="current-password"
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ingresa el token privado"
              autoFocus
            />
          </label>
          <label className="check-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Recordar en este navegador
          </label>
          {error && <p className="auth-error">{error}</p>}
          <div className="auth-actions">
            <button className="btn btn-primary" type="submit" disabled={checking}>
              {checking ? "Verificando..." : "Entrar"}
            </button>
            <a className="btn btn-ghost" href="../">Ver tienda</a>
          </div>
        </form>
      </section>
    </main>
  );
}

function AdminShell() {
  const D = window.useData();
  const hash = (window.location.hash || "#dashboard").slice(1);
  const [page, setPage] = React.useState(NAV.some(n => n.id === hash) ? hash : "dashboard");
  const [, setAuthRev] = React.useState(0);
  const toast = window.useToast();
  const config = D.getConfig();

  const go = (id) => { setPage(id); window.location.hash = id; window.scrollTo(0, 0); };

  React.useEffect(() => {
    const h = () => { const id = (window.location.hash || "#dashboard").slice(1); if (NAV.some(n => n.id === id)) setPage(id); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  React.useEffect(() => {
    const h = () => setAuthRev(r => r + 1);
    window.addEventListener("dianery:auth", h);
    return () => window.removeEventListener("dianery:auth", h);
  }, []);

  if (!D.hasAdminToken()) {
    return (
      <React.Fragment>
        <AdminLogin />
        <window.Toast msg={toast} />
      </React.Fragment>
    );
  }

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
              <SHI.store /><span className="vs-label">Ver tienda</span><SHI.external />
            </a>
            <button className="btn btn-ghost btn-compact" type="button" onClick={() => D.clearAdminToken()}>
              Salir
            </button>
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
