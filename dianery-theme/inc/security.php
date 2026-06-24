<?php
/**
 * Reglas de seguridad y robustez.
 */

defined('ABSPATH') || exit;

function vd_restrict_rest_for_catalog_cpts(array $args, string $post_type): array {
    if (in_array($post_type, ['vd_producto', 'vd_banner', 'vd_content_card'], true)) {
        $args['show_in_rest'] = false;
    }

    return $args;
}
add_filter('register_post_type_args', 'vd_restrict_rest_for_catalog_cpts', 10, 2);

function vd_sanitize_phone(string $phone): string {
    return preg_replace('/[^0-9]/', '', $phone);
}
