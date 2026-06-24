<?php
/**
 * Taxonomías preparadas para filtros futuros.
 */

defined('ABSPATH') || exit;

function vd_register_taxonomies(): void {
    $taxonomies = [
        'vd_categoria_producto' => __('Categorías de producto', 'variedades-dianery'),
        'vd_linea_producto'     => __('Líneas de producto', 'variedades-dianery'),
        'vd_tipo_piel'          => __('Tipos de piel', 'variedades-dianery'),
        'vd_tipo_cabello'       => __('Tipos de cabello', 'variedades-dianery'),
        'vd_fragancia'          => __('Fragancias', 'variedades-dianery'),
        'vd_ocasion'            => __('Ocasiones', 'variedades-dianery'),
    ];

    foreach ($taxonomies as $taxonomy => $label) {
        register_taxonomy($taxonomy, ['vd_producto'], [
            'label' => $label,
            'public' => true,
            'show_in_rest' => false,
            'hierarchical' => true,
            'rewrite' => ['slug' => str_replace('vd_', '', $taxonomy)],
        ]);
    }
}
add_action('init', 'vd_register_taxonomies');
