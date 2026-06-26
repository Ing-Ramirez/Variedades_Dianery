/* Header + Banner + Catálogo (toolbar + grilla de productos, datos reales) */
const { Ic } = window;
const D = window.DianeryData;

function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
function scrollToCatalog() {
  const el = document.getElementById("catalogo");
  if (el) el.scrollIntoView({ behavior: "smooth" });
  else scrollTop();
}

/* Comportamiento de navegación: sin enlaces muertos */
function navAction(e, item) {
  e.preventDefault();
  if (item.label === "Inicio") scrollTop();
  else if (item.label === "Productos") scrollToCatalog();
  else window.shopToast && window.shopToast("Próximamente");
}

function Header({ brand, query, onQuery, cartCount, onCartClick }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const onNav = (e, item) => { navAction(e, item); setMenuOpen(false); };

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <button className="menu-btn" aria-label="Abrir menú" onClick={() => setMenuOpen(o => !o)}>
          <Ic.menu />
        </button>
        <a className="logo" href="#" onClick={e => { e.preventDefault(); scrollTop(); }}>
          <span className="logo-name">{brand.name}</span>
          <span className="logo-sub">{brand.tagline}</span>
        </a>
        <nav className="main-nav">
          {brand.nav.map((n, i) => (
            <a key={i} className={"nav-item" + (n.current ? " current" : "")} href={n.href} onClick={e => onNav(e, n)}>
              {n.label}
              {n.hasMenu && <Ic.chevron className="chev" />}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <div className="search-box">
            <Ic.search />
            <input
              type="search"
              value={query}
              onChange={e => onQuery(e.target.value)}
              placeholder={brand.searchPlaceholder}
              aria-label="Buscar productos"
            />
          </div>
          <button className="cart-btn" onClick={onCartClick} aria-label="Abrir carrito">
            <Ic.cart />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-nav">
          {brand.nav.map((n, i) => (
            <a key={i} className="mobile-nav-item" href={n.href} onClick={e => onNav(e, n)}>{n.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

function Banner({ catalog }) {
  const img = catalog.bannerImage;
  return (
    <div className="wrap">
      <div className="banner">
        {img
          ? <div className="banner-img" style={{ backgroundImage: `url(${img})` }} />
          : <div className="ph"><span className="ph-label">banner · foto lifestyle de productos</span></div>}
        <div className="banner-overlay" />
        <div className="banner-content">
          <span className="kicker">{catalog.bannerKicker}</span>
          <h1>{catalog.bannerTitle}</h1>
        </div>
      </div>
    </div>
  );
}

/* Dropdown reutilizable para los filtros / orden de la toolbar */
function Dropdown({ label, value, options, onChange, disabled }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = options.find(o => o.value === value);
  return (
    <div className="dd" ref={ref}>
      <button className={"filter-pill" + (open ? " open" : "")} disabled={disabled}
        onClick={() => setOpen(o => !o)}>
        {label ? label + ": " : ""}{current ? current.label : value}
        <Ic.chevron style={{ width: 12, height: 12, opacity: 0.6 }} />
      </button>
      {open && (
        <div className="dd-menu">
          {options.map(o => (
            <button key={o.value} className={"dd-item" + (o.value === value ? " active" : "")}
              disabled={o.disabled}
              onClick={() => { if (o.disabled) return; onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductImage({ images, tag, className }) {
  const main = (images || [])[0];
  if (main) {
    return (
      <div className={"card-media " + (className || "")} style={{ backgroundImage: `url(${main})` }}>
        {tag && <span className="card-tag">{tag}</span>}
      </div>
    );
  }
  return (
    <div className={"card-media ph " + (className || "")}>
      {tag && <span className="card-tag">{tag}</span>}
      <span className="ph-label">sin imagen</span>
    </div>
  );
}

function ProductCard({ p, onOpen, onAdd }) {
  const out = p.stock <= 0;
  return (
    <article className="card">
      <div className="card-media-wrap" onClick={() => onOpen(p)} role="button" tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter") onOpen(p); }}>
        <ProductImage images={p.images} tag={p.tag} />
        {out && <span className="card-out">Agotado</span>}
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p>{p.desc}</p>
        <div className="card-foot">
          <span className="card-price">{D.formatCOP(p.price)}</span>
        </div>
        <div className="card-actions">
          <button className="btn-line" onClick={() => onOpen(p)}>Ver<Ic.arrow style={{ width: 13, height: 13 }} /></button>
          <button className="btn-add" disabled={out} onClick={() => onAdd(p)}>
            <Ic.cart style={{ width: 15, height: 15 }} />{out ? "Agotado" : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
}

const PRICE_RANGES = [
  { value: "all", label: "Todos los precios", test: () => true },
  { value: "lt30", label: "Hasta $30.000", test: p => p.price <= 30000 },
  { value: "30-60", label: "$30.000 – $60.000", test: p => p.price > 30000 && p.price <= 60000 },
  { value: "gt60", label: "Más de $60.000", test: p => p.price > 60000 }
];

const SORTS = {
  recent: { label: "Más recientes", cmp: (a, b) => numId(b.id) - numId(a.id) },
  priceAsc: { label: "Precio: menor a mayor", cmp: (a, b) => a.price - b.price },
  priceDesc: { label: "Precio: mayor a menor", cmp: (a, b) => b.price - a.price },
  nameAsc: { label: "Nombre: A-Z", cmp: (a, b) => a.name.localeCompare(b.name, "es") },
  nameDesc: { label: "Nombre: Z-A", cmp: (a, b) => b.name.localeCompare(a.name, "es") }
};

function numId(id) { return Number(String(id).replace(/\D/g, "")) || 0; }

function Toolbar({ category, setCategory, priceRange, setPriceRange, sort, setSort, count, categories }) {
  return (
    <div className="toolbar">
      <Dropdown label="Categoría" value={category}
        options={[{ value: "all", label: "Todas" }, ...categories.map(c => ({ value: c, label: c }))]}
        onChange={setCategory} />
      <Dropdown label="Colecciones" value="soon"
        options={[{ value: "soon", label: "Próximamente", disabled: true }]}
        onChange={() => {}} />
      <Dropdown label="Precio" value={priceRange}
        options={PRICE_RANGES.map(r => ({ value: r.value, label: r.label }))}
        onChange={setPriceRange} />
      <span className="count-label">{count} {count === 1 ? "producto" : "productos"}</span>
      <Dropdown value={sort}
        options={Object.keys(SORTS).map(k => ({ value: k, label: SORTS[k].label }))}
        onChange={setSort} />
    </div>
  );
}

function Catalog({ query, onOpenDetail, onAddToCart }) {
  const [category, setCategory] = React.useState("all");
  const [priceRange, setPriceRange] = React.useState("all");
  const [sort, setSort] = React.useState("recent");

  const all = D.getProducts().filter(p => p.active);
  const categories = D.getCategories(true);
  const range = PRICE_RANGES.find(r => r.value === priceRange) || PRICE_RANGES[0];
  const needle = query.trim().toLowerCase();

  let products = all.filter(p => {
    const okCat = category === "all" || p.tag === category;
    const okPrice = range.test(p);
    const okQ = !needle ||
      p.name.toLowerCase().includes(needle) ||
      (p.tag || "").toLowerCase().includes(needle) ||
      (p.sku || "").toLowerCase().includes(needle) ||
      (p.desc || "").toLowerCase().includes(needle);
    return okCat && okPrice && okQ;
  });
  products = products.slice().sort(SORTS[sort].cmp);

  return (
    <main className="wrap" id="catalogo">
      <Toolbar category={category} setCategory={setCategory}
        priceRange={priceRange} setPriceRange={setPriceRange}
        sort={sort} setSort={setSort} count={products.length} categories={categories} />
      {products.length === 0 ? (
        <div className="catalog-empty">
          <p>No encontramos productos con esa búsqueda.</p>
        </div>
      ) : (
        <div className="grid">
          {products.map(p => <ProductCard key={p.id} p={p} onOpen={onOpenDetail} onAdd={onAddToCart} />)}
        </div>
      )}
    </main>
  );
}

/* Detalle de producto con galería simple */
function ProductDetail({ product, onClose, onAddToCart }) {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => { setActive(0); }, [product && product.id]);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  if (!product) return null;

  const images = product.images || [];
  const out = product.stock <= 0;
  const main = images[active];

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar"><Ic.x /></button>
        <div className="modal-grid">
          <div className="modal-gallery">
            {main
              ? <div className="modal-main" style={{ backgroundImage: `url(${main})` }} />
              : <div className="modal-main ph"><span className="ph-label">sin imagen</span></div>}
            {images.length > 1 && (
              <div className="modal-thumbs">
                {images.map((src, i) => (
                  <button key={i} className={"modal-thumb" + (i === active ? " active" : "")}
                    style={{ backgroundImage: `url(${src})` }}
                    onClick={() => setActive(i)} aria-label={"Imagen " + (i + 1)} />
                ))}
              </div>
            )}
          </div>
          <div className="modal-info">
            <span className="card-tag static">{product.tag}</span>
            <h2>{product.name}</h2>
            <div className="modal-sku">SKU: {product.sku}</div>
            <div className="modal-price">{D.formatCOP(product.price)}</div>
            <p className="modal-desc">{product.desc}</p>
            <div className="modal-stock">
              {out ? <span className="out">Producto sin stock disponible.</span>
                   : <span>{product.stock} unidades disponibles</span>}
            </div>
            <div className="modal-cta">
              <button className="btn-add lg" disabled={out}
                onClick={() => { onAddToCart(product); onClose(); }}>
                <Ic.cart style={{ width: 17, height: 17 }} />{out ? "Sin stock" : "Agregar al carrito"}
              </button>
              <a className="btn-wa" href={D.whatsappProductUrl(product)} target="_blank" rel="noopener">
                <Ic.whatsapp style={{ width: 17, height: 17 }} />Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Header, Banner, Catalog, ProductDetail });
