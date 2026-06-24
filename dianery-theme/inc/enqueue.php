<?php
/**
 * Carga de assets sin dependencia obligatoria de jQuery.
 */

defined('ABSPATH') || exit;

function vd_enqueue_assets(): void {
    wp_enqueue_style('vd-main', VD_THEME_URI . '/assets/css/main.css', [], VD_THEME_VERSION);
    wp_enqueue_script('vd-main', VD_THEME_URI . '/assets/js/main.js', [], VD_THEME_VERSION, true);
}
add_action('wp_enqueue_scripts', 'vd_enqueue_assets');

function vd_maybe_remove_jquery(): void {
    if (!is_admin() && apply_filters('vd_remove_frontend_jquery', true)) {
        wp_deregister_script('jquery');
    }
}
add_action('wp_enqueue_scripts', 'vd_maybe_remove_jquery', 100);
