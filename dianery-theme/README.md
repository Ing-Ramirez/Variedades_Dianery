# Variedades Dianery Theme

Tema WordPress personalizado liviano para una landing + catálogo + tienda asistida por WhatsApp.

## Enfoque

- WordPress en hosting tradicional con PHP 8.2+ y MySQL/MariaDB.
- Tema modular sin page builder pesado.
- Componentes con `get_template_part(..., $args)` para reducir dependencias globales.
- Capa de datos en `inc/data-products.php` e `inc/data-banners.php` para preparar integraciones futuras.
- JavaScript Vanilla sin dependencia obligatoria de jQuery.
- CSS con variables, BEM y tipografía fluida con `clamp()`.
- CPTs privados en REST por defecto para reducir exposición del catálogo.

## Estructura

```txt
dianery-theme/
  assets/css/main.css
  assets/js/main.js
  inc/
  template-parts/
  front-page.php
  header.php
  footer.php
```

## Próximos pasos

1. Instalar WordPress en hosting local o tradicional.
2. Copiar `dianery-theme/` a `wp-content/themes/`.
3. Activar el tema desde Apariencia > Temas.
4. Crear menús, banners y productos.
5. Configurar logo, color principal y WhatsApp desde el personalizador.
6. Conectar ACF o metaboxes propios para los campos prefijados `vd_`.
