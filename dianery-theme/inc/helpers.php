<?php
/**
 * Helpers compartidos del tema.
 */

defined('ABSPATH') || exit;

function vd_format_price($price): string {
    if ($price === '' || $price === null) {
        return '';
    }

    return number_format((float) $price, 0, ',', '.');
}

function vd_get_variant_label(string $attribute_type): string {
    $labels = [
        'tono'         => __('Selecciona un tono', 'variedades-dianery'),
        'tamano'       => __('Selecciona un tamaño', 'variedades-dianery'),
        'fragancia'    => __('Selecciona una fragancia', 'variedades-dianery'),
        'tipo_piel'    => __('Selecciona tipo de piel', 'variedades-dianery'),
        'tipo_cabello' => __('Selecciona tipo de cabello', 'variedades-dianery'),
        'talla'        => __('Selecciona una talla', 'variedades-dianery'),
        'presentacion' => __('Selecciona una presentación', 'variedades-dianery'),
    ];

    return $labels[$attribute_type] ?? __('Selecciona una opción', 'variedades-dianery');
}

function vd_get_whatsapp_url(string $phone, string $message): string {
    $clean_phone = preg_replace('/[^0-9]/', '', $phone);
    return 'https://wa.me/' . $clean_phone . '?text=' . rawurlencode($message);
}
