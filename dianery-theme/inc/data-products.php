<?php
/**
 * Capa de datos de productos: abstrae CPT/ACF de las vistas.
 */

defined('ABSPATH') || exit;

function vd_get_featured_products(int $limit = 8): array {
    $query = new WP_Query([
        'post_type' => 'vd_producto',
        'posts_per_page' => $limit,
        'orderby' => ['menu_order' => 'ASC', 'date' => 'DESC'],
        'meta_query' => [
            ['key' => 'vd_producto_activo', 'value' => '1', 'compare' => '='],
            ['key' => 'vd_producto_destacado', 'value' => '1', 'compare' => '='],
        ],
    ]);

    $products = [];
    foreach ($query->posts as $post) {
        $products[] = vd_map_product_to_card_data((int) $post->ID);
    }
    wp_reset_postdata();

    return $products;
}

function vd_map_product_to_card_data(int $product_id): array {
    $raw_price = get_post_meta($product_id, 'vd_producto_precio', true);
    $phone = get_theme_mod('vd_whatsapp_phone', '');
    $base_text = sprintf(__('Hola, me interesa el producto: %s', 'variedades-dianery'), get_the_title($product_id));

    return [
        'id' => $product_id,
        'title' => get_the_title($product_id),
        'description' => get_post_meta($product_id, 'vd_producto_descripcion_corta', true) ?: get_the_excerpt($product_id),
        'price' => vd_format_price($raw_price),
        'raw_price' => $raw_price,
        'badge' => get_post_meta($product_id, 'vd_producto_etiqueta', true),
        'image_url' => get_the_post_thumbnail_url($product_id, 'vd-product-card') ?: vd_get_placeholder_image_url(),
        'image_alt' => get_the_title($product_id),
        'attribute_type' => get_post_meta($product_id, 'vd_tipo_atributo', true) ?: 'ninguno',
        'variants' => vd_get_product_variants($product_id),
        'whatsapp_phone' => $phone,
        'whatsapp_text' => $base_text,
    ];
}

function vd_get_product_variants(int $product_id): array {
    $stored = get_post_meta($product_id, 'vd_producto_variaciones', true);
    if (!is_array($stored)) {
        return [];
    }

    $variants = [];
    foreach ($stored as $variant) {
        $variants[] = [
            'name' => sanitize_text_field($variant['vd_variante_nombre'] ?? ''),
            'price' => isset($variant['vd_variante_precio']) ? (float) $variant['vd_variante_precio'] : '',
            'color' => !empty($variant['vd_variante_color']) ? sanitize_hex_color($variant['vd_variante_color']) : '',
            'image_url' => esc_url_raw($variant['vd_variante_imagen'] ?? ''),
            'stock' => !empty($variant['vd_variante_stock']),
            'sku' => sanitize_text_field($variant['vd_variante_codigo'] ?? ''),
        ];
    }

    return $variants;
}
