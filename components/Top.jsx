/* Header + Banner + Catálogo (toolbar + grilla de productos) */
const { Ic } = window;

function Header({ brand }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="logo" href="#">
          <span className="logo-name">{brand.name}</span>
          <span className="logo-sub">{brand.tagline}</span>
        </a>
        <nav className="main-nav">
          {brand.nav.map((n, i) => (
            <a key={i} className={"nav-item" + (n.current ? " current" : "")} href={n.href}>
              {n.label}
              {n.hasMenu && <Ic.chevron className="chev" />}
            </a>
          ))}
        </nav>
        <div className="search-box">
          <Ic.search />
          <span>{brand.searchPlaceholder}</span>
        </div>
      </div>
    </header>
  );
}

function Banner({ catalog }) {
  return (
    <div className="wrap">
      <div className="banner">
        <div className="ph">
          <span className="ph-label">banner · foto lifestyle de productos</span>
        </div>
        <div className="banner-overlay" />
        <div className="banner-content">
          <span className="kicker">{catalog.bannerKicker}</span>
          <h1>{catalog.bannerTitle}</h1>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ catalog }) {
  return (
    <React.Fragment>
      <div className="breadcrumb">
        {catalog.breadcrumb.map((b, i) => (
          <React.Fragment key={i}>
            <span>{b}</span>
            {i < catalog.breadcrumb.length - 1 && <span className="sep">/</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="toolbar">
        {catalog.filters.map((f, i) => (
          <button key={i} className="filter-pill">{f}<Ic.chevron style={{ width: 12, height: 12, opacity: 0.6 }} /></button>
        ))}
        <span className="count-label" style={{ marginLeft: 12 }}>{catalog.countLabel}</span>
        <button className="sort-pill">{catalog.sortLabel}<Ic.chevron style={{ width: 12, height: 12, opacity: 0.6 }} /></button>
      </div>
    </React.Fragment>
  );
}

function ProductCard({ p }) {
  return (
    <article className="card">
      <div className="card-media ph">
        <span className="card-tag">{p.tag}</span>
        <span className="ph-label">foto de producto</span>
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p>{p.desc}</p>
        <div className="card-foot">
          <span className="card-price">{p.price}</span>
          <span className="card-cta">Ver<Ic.arrow style={{ width: 13, height: 13 }} /></span>
        </div>
      </div>
    </article>
  );
}

function Catalog({ catalog }) {
  return (
    <main className="wrap">
      <Toolbar catalog={catalog} />
      <div className="grid">
        {catalog.products.map((p, i) => <ProductCard key={i} p={p} />)}
      </div>
    </main>
  );
}

Object.assign(window, { Header, Banner, Catalog });
