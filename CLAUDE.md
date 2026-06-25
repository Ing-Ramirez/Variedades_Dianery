# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, build-less React prototype of the "Variedades Dianery" storefront (Spanish-language store of assorted home/lifestyle goods). It is a design prototype, not the production site — the production site is a separate WordPress theme in the sibling `../Variedades_Dianery/` directory (see its own CLAUDE.md). This prototype shares the brand and visual direction but no code.

## Running

There is **no build step, no npm, no package.json, no tests**. React, ReactDOM, and Babel Standalone are loaded from CDN in `Variedades Dianery.html`, which compiles the `type="text/babel"` JSX modules in the browser at load time.

To view: open `Variedades Dianery.html` in a browser, or serve the folder over a static server (the `<script src>` tags are relative, so `file://` works but a local server avoids any cross-origin surprises).

## Architecture

### Globals, not imports
This is pre-bundler React. There is no module system — every file attaches its exports to `window` (`Object.assign(window, {...})` or `window.Ic = ...`) and later files destructure them back off `window`. **Script order in `Variedades Dianery.html` is the dependency graph** and is load-bearing:

1. `config.js` → `window.siteConfig`
2. `tweaks-panel.jsx` → Tweak* controls + `useTweaks`
3. `components/Icons.jsx` → `window.Ic`
4. `components/Top.jsx` → `Header`, `Banner`, `Catalog`
5. `components/Bottom.jsx` → `ClosingCampaign`, `Footer`, `FloatingChat`
6. `app.jsx` → `App`, mounts to `#root`

Adding a component means: write it, `Object.assign(window, {...})` it, and add a `<script type="text/babel">` tag in the correct order in the HTML.

### Content lives in config.js, never in components
`config.js` (`window.siteConfig`) is the single source of all copy, nav, products, footer columns, contact info, legal text — all in Spanish. Components are pure presentation: they receive a slice of `siteConfig` as props and render it. To change wording or add a product, edit `config.js`, not the component.

### The Tweaks panel + EDITMODE protocol
`tweaks-panel.jsx` is a reusable design-tool scaffold ("omelette" starter) for live-editing the prototype inside a host editor. Key pieces:

- `App` defines `TWEAK_DEFAULTS` wrapped in a literal `/*EDITMODE-BEGIN*/{ ... }/*EDITMODE-END*/` comment fence. The host editor rewrites the JSON **inside that fence on disk** when a tweak changes — keep it valid JSON and keep the fence markers intact.
- `useTweaks(defaults)` returns `[values, setTweak]`. `setTweak` updates React state *and* `postMessage`s `__edit_mode_set_keys` to `window.parent` (the host persists it) and dispatches a same-window `tweakchange` event.
- `TweaksPanel` speaks the host protocol: posts `__edit_mode_available`, listens for `__activate_edit_mode`/`__deactivate_edit_mode`, posts `__edit_mode_dismissed`. It registers its message listener before announcing availability — don't reorder that.
- Tweaks are applied in `app.jsx` mostly by writing CSS custom properties (`--accent`, `--footer-bg`, `--radius`, …) onto `document.documentElement` in a `useEffect`, so styling stays in `styles.css`/`footer.css` and JS only sets variables.

Reuse the provided `Tweak*` controls (`TweakColor`, `TweakSlider`, `TweakRadio`, `TweakToggle`, `TweakSelect`, `TweakText`, `TweakNumber`, `TweakButton`) rather than hand-rolling inputs. For color tweaks, curate 3–4 options instead of a free picker. The `@ds-adherence-ignore` banner at the top of the file is intentional — that file is allowed raw hex/px.

### Styling
Plain CSS in `styles.css` (layout, header, catalog, cards) and `footer.css` (footer + floating chat). Theming is driven by CSS custom properties on `:root`/`documentElement` set from tweaks. `Variedades Dianery.html` loads Google Fonts (Spectral + Archivo).

### Icons
`components/Icons.jsx` exposes `window.Ic`, a flat map of inline-SVG components (UI glyphs, social, contact). Footer/social rendering filters by `Ic[iconName]` existing, so an icon must be added here before it can be referenced from `config.js`.
