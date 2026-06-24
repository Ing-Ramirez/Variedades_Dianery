<?php
/**
 * Bootstrap del tema Variedades Dianery.
 */

defined('ABSPATH') || exit;

define('VD_THEME_VERSION', '0.1.0');
define('VD_THEME_DIR', get_template_directory());
define('VD_THEME_URI', get_template_directory_uri());

$vd_includes = [
    'inc/enqueue.php',
    'inc/helpers.php',
    'inc/security.php',
    'inc/custom-post-types.php',
    'inc/custom-taxonomies.php',
    'inc/theme-settings.php',
    'inc/data-products.php',
    'inc/data-banners.php',
    'inc/image-helpers.php',
];

foreach ($vd_includes as $vd_file) {
    require_once VD_THEME_DIR . '/' . $vd_file;
}

function vd_theme_setup(): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', [
        'height'      => 80,
        'width'       => 240,
        'flex-height' => true,
        'flex-width'  => true,
    ]);
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);

    register_nav_menus([
        'primary'   => __('Menú principal', 'variedades-dianery'),
        'secondary' => __('Menú superior', 'variedades-dianery'),
        'footer'    => __('Menú del footer', 'variedades-dianery'),
    ]);

    add_image_size('vd-hero-desktop', 1920, 700, true);
    add_image_size('vd-hero-mobile', 900, 1100, true);
    add_image_size('vd-product-card', 800, 800, true);
    add_image_size('vd-content-card', 900, 500, true);
}
add_action('after_setup_theme', 'vd_theme_setup');
