<?php
/**
 * Custom Post Types para catálogo administrable.
 */

defined('ABSPATH') || exit;

function vd_register_custom_post_types(): void {
    register_post_type('vd_banner', [
        'labels' => ['name' => __('Banners', 'variedades-dianery'), 'singular_name' => __('Banner', 'variedades-dianery')],
        'public' => true,
        'show_ui' => true,
        'show_in_rest' => false,
        'menu_icon' => 'dashicons-images-alt2',
        'supports' => ['title', 'editor', 'thumbnail', 'page-attributes'],
    ]);

    register_post_type('vd_producto', [
        'labels' => ['name' => __('Productos', 'variedades-dianery'), 'singular_name' => __('Producto', 'variedades-dianery')],
        'public' => true,
        'show_ui' => true,
        'show_in_rest' => false,
        'menu_icon' => 'dashicons-products',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'page-attributes'],
        'has_archive' => true,
        'rewrite' => ['slug' => 'productos'],
    ]);

    register_post_type('vd_content_card', [
        'labels' => ['name' => __('Tarjetas de contenido', 'variedades-dianery'), 'singular_name' => __('Tarjeta de contenido', 'variedades-dianery')],
        'public' => true,
        'show_ui' => true,
        'show_in_rest' => false,
        'menu_icon' => 'dashicons-screenoptions',
        'supports' => ['title', 'editor', 'thumbnail', 'page-attributes'],
    ]);
}
add_action('init', 'vd_register_custom_post_types');
