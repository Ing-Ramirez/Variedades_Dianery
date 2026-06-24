<?php
/**
 * Capa de datos de banners/hero.
 */

defined('ABSPATH') || exit;

function vd_get_active_banners(int $limit = 3): array {
    $query = new WP_Query([
        'post_type' => 'vd_banner',
        'posts_per_page' => $limit,
        'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        'meta_key' => 'vd_banner_activo',
        'meta_value' => '1',
    ]);

    $banners = [];
    foreach ($query->posts as $post) {
        $banners[] = vd_map_banner_to_view_data((int) $post->ID);
    }
    wp_reset_postdata();

    return $banners;
}

function vd_map_banner_to_view_data(int $banner_id): array {
    return [
        'title' => get_the_title($banner_id),
        'subtitle' => get_post_meta($banner_id, 'vd_banner_subtitulo', true),
        'eyebrow' => get_post_meta($banner_id, 'vd_banner_etiqueta', true),
        'button_text' => get_post_meta($banner_id, 'vd_banner_boton_texto', true),
        'button_url' => get_post_meta($banner_id, 'vd_banner_boton_url', true),
        'desktop_image' => get_the_post_thumbnail_url($banner_id, 'vd-hero-desktop'),
        'mobile_image' => get_post_meta($banner_id, 'vd_banner_imagen_mobile', true),
        'alt' => get_the_title($banner_id),
    ];
}

function vd_preload_hero_image(): void {
    if (!is_front_page()) {
        return;
    }

    $banners = vd_get_active_banners(1);
    if (empty($banners[0]['desktop_image'])) {
        return;
    }

    printf('<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n", esc_url($banners[0]['desktop_image']));
}
add_action('wp_head', 'vd_preload_hero_image', 1);
