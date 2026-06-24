<?php
/** Página principal modular. */
defined('ABSPATH') || exit;
get_header();

$banners = vd_get_active_banners(3);
get_template_part('template-parts/hero', null, ['banners' => $banners]);
get_template_part('template-parts/contact', 'banner');
get_template_part('template-parts/featured', 'products', ['products' => vd_get_featured_products(8)]);
get_template_part('template-parts/content', 'cards');
get_template_part('template-parts/video', 'section');
get_template_part('template-parts/closing', 'campaign');

get_footer();
